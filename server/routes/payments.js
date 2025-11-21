const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Package = require('../models/Package');
const PaymentTransaction = require('../models/PaymentTransaction');
const PlatformSettings = require('../models/PlatformSettings');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for package purchase
// @access  Private
router.post('/create-order', auth, [
  body('packageId').notEmpty().withMessage('Package ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { packageId } = req.body;
    const userId = req.user._id;

    // Get package details
    const packageData = await Package.findById(packageId);
    if (!packageData || !packageData.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or inactive'
      });
    }

    // Get Razorpay settings
    const settings = await PlatformSettings.getSettings();
    const razorpaySettings = settings.payment?.paymentGateways?.razorpay;

    if (!razorpaySettings || !razorpaySettings.enabled || !razorpaySettings.keyId || !razorpaySettings.keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay is not configured or enabled'
      });
    }

    // Calculate amounts
    const baseAmount = packageData.price;
    let gstAmount = 0;
    let totalAmount = baseAmount;

    if (settings.payment?.gstEnabled && packageData.gstApplicable) {
      const gstPercentage = settings.payment.gstPercentage || 18;
      gstAmount = (baseAmount * gstPercentage) / 100;
      totalAmount = baseAmount + gstAmount;
    }

    // Create Razorpay order
    let Razorpay;
    try {
      Razorpay = require('razorpay');
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay package not installed. Please install: npm install razorpay'
      });
    }

    const razorpay = new Razorpay({
      key_id: razorpaySettings.keyId,
      key_secret: razorpaySettings.keySecret
    });

    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: packageData.currency || 'INR',
      receipt: `pkg_${packageId}_${Date.now()}`,
      notes: {
        packageId: packageId.toString(),
        userId: userId.toString(),
        packageName: packageData.name
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment transaction record
    const transaction = new PaymentTransaction({
      user: userId,
      package: packageId,
      paymentGateway: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      amount: baseAmount,
      gstAmount: gstAmount,
      totalAmount: totalAmount,
      currency: packageData.currency || 'INR',
      status: 'initiated',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await transaction.save();

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: razorpaySettings.keyId
      },
      transaction: {
        id: transaction._id,
        amount: totalAmount,
        baseAmount: baseAmount,
        gstAmount: gstAmount
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
});

// @route   POST /api/payments/verify-payment
// @desc    Verify Razorpay payment and activate package
// @access  Private
router.post('/verify-payment', auth, [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    // Get transaction
    const transaction = await PaymentTransaction.findById(transactionId)
      .populate('package')
      .populate('user');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user owns this transaction
    if (transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to transaction'
      });
    }

    // Get Razorpay settings
    const settings = await PlatformSettings.getSettings();
    const razorpaySettings = settings.payment?.paymentGateways?.razorpay;

    if (!razorpaySettings || !razorpaySettings.keySecret) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay is not configured'
      });
    }

    // Verify signature
    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', razorpaySettings.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      transaction.status = 'failed';
      transaction.error = {
        message: 'Payment signature verification failed',
        code: 'SIGNATURE_MISMATCH'
      };
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update transaction
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.status = 'success';
    transaction.paymentResponse = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    };

    // Activate package for user
    const packageData = transaction.package;
    const user = transaction.user;

    // Calculate expiry date
    const expiryDate = new Date();
    if (packageData.period === 'days') {
      expiryDate.setDate(expiryDate.getDate() + packageData.periodValue);
    } else if (packageData.period === 'months') {
      expiryDate.setMonth(expiryDate.getMonth() + packageData.periodValue);
    } else if (packageData.period === 'years') {
      expiryDate.setFullYear(expiryDate.getFullYear() + packageData.periodValue);
    }

    transaction.packageActivated = true;
    transaction.activatedAt = new Date();
    transaction.expiresAt = expiryDate;

    // Update user package subscription
    if (!user.activePackage) {
      user.activePackage = {};
    }
    user.activePackage.packageId = packageData._id;
    user.activePackage.activatedAt = new Date();
    user.activePackage.expiresAt = expiryDate;
    user.activePackage.transactionId = transaction._id;

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      message: 'Payment verified and package activated successfully',
      transaction: {
        id: transaction._id,
        status: transaction.status,
        packageActivated: transaction.packageActivated,
        expiresAt: transaction.expiresAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhook events
// @access  Public (verified by signature)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Get Razorpay settings
    const settings = await PlatformSettings.getSettings();
    const razorpaySettings = settings.payment?.paymentGateways?.razorpay;

    if (!razorpaySettings || !razorpaySettings.webhookSecret) {
      return res.status(400).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySettings.webhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const paymentData = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentData) {
      // Find transaction by payment ID
      const transaction = await PaymentTransaction.findOne({
        razorpayPaymentId: paymentData.id
      }).populate('package').populate('user');

      if (transaction && transaction.status !== 'success') {
        transaction.status = 'captured';
        transaction.packageActivated = true;
        transaction.activatedAt = new Date();

        // Calculate expiry date
        const packageData = transaction.package;
        const user = transaction.user;
        const expiryDate = new Date();
        if (packageData.period === 'days') {
          expiryDate.setDate(expiryDate.getDate() + packageData.periodValue);
        } else if (packageData.period === 'months') {
          expiryDate.setMonth(expiryDate.getMonth() + packageData.periodValue);
        } else if (packageData.period === 'years') {
          expiryDate.setFullYear(expiryDate.getFullYear() + packageData.periodValue);
        }

        transaction.expiresAt = expiryDate;

        // Update user package subscription
        if (!user.activePackage) {
          user.activePackage = {};
        }
        user.activePackage.packageId = packageData._id;
        user.activePackage.activatedAt = new Date();
        user.activePackage.expiresAt = expiryDate;
        user.activePackage.transactionId = transaction._id;

        await transaction.save();
        await user.save();
      }
    } else if (event === 'payment.failed' && paymentData) {
      const transaction = await PaymentTransaction.findOne({
        razorpayPaymentId: paymentData.id
      });

      if (transaction) {
        transaction.status = 'failed';
        transaction.error = {
          message: paymentData.error_description || 'Payment failed',
          code: paymentData.error_code || 'PAYMENT_FAILED'
        };
        await transaction.save();
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

module.exports = router;


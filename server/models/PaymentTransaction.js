const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Package Information
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  
  // Payment Gateway Information
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal'],
    default: 'razorpay',
    required: true
  },
  
  // Razorpay Specific Fields
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // GST Information
  gstAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'initiated', 'success', 'failed', 'cancelled', 'refunded', 'captured'],
    default: 'pending',
    index: true
  },
  
  // Payment Response
  paymentResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Error Information
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Package Activation
  packageActivated: {
    type: Boolean,
    default: false
  },
  activatedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentTransactionSchema.index({ user: 1, status: 1 });
paymentTransactionSchema.index({ razorpayOrderId: 1 });
paymentTransactionSchema.index({ razorpayPaymentId: 1 });
paymentTransactionSchema.index({ status: 1, createdAt: -1 });
paymentTransactionSchema.index({ package: 1, status: 1 });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);


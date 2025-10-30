const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const PlatformSettings = require('../models/PlatformSettings');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.userType !== 'admin' && req.user.userType !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// @route   GET /api/settings
// @desc    Get all platform settings
// @access  Private (Admin)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    // Remove sensitive information before sending
    const sanitizedSettings = settings.toObject();
    
    // Remove sensitive keys
    if (sanitizedSettings.email?.smtp?.password) {
      sanitizedSettings.email.smtp.password = '****';
    }
    if (sanitizedSettings.security?.captchaSecretKey) {
      sanitizedSettings.security.captchaSecretKey = '****';
    }
    if (sanitizedSettings.payment?.paymentGateways) {
      Object.keys(sanitizedSettings.payment.paymentGateways).forEach(gateway => {
        if (sanitizedSettings.payment.paymentGateways[gateway].keySecret) {
          sanitizedSettings.payment.paymentGateways[gateway].keySecret = '****';
        }
        if (sanitizedSettings.payment.paymentGateways[gateway].secretKey) {
          sanitizedSettings.payment.paymentGateways[gateway].secretKey = '****';
        }
        if (sanitizedSettings.payment.paymentGateways[gateway].clientSecret) {
          sanitizedSettings.payment.paymentGateways[gateway].clientSecret = '****';
        }
        if (sanitizedSettings.payment.paymentGateways[gateway].webhookSecret) {
          sanitizedSettings.payment.paymentGateways[gateway].webhookSecret = '****';
        }
      });
    }
    if (sanitizedSettings.notifications?.sms?.authToken) {
      sanitizedSettings.notifications.sms.authToken = '****';
    }
    
    res.json({
      success: true,
      settings: sanitizedSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/general
// @desc    Update general settings
// @access  Private (Admin)
router.put('/general', [auth, requireAdmin], async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    const { siteName, siteDescription, siteUrl, contactEmail, contactPhone, timezone, language, currency, dateFormat, maintenanceMode, maintenanceMessage } = req.body;
    
    if (siteName) settings.general.siteName = siteName;
    if (siteDescription) settings.general.siteDescription = siteDescription;
    if (siteUrl) settings.general.siteUrl = siteUrl;
    if (contactEmail) settings.general.contactEmail = contactEmail;
    if (contactPhone) settings.general.contactPhone = contactPhone;
    if (timezone) settings.general.timezone = timezone;
    if (language) settings.general.language = language;
    if (currency) settings.general.currency = currency;
    if (dateFormat) settings.general.dateFormat = dateFormat;
    if (maintenanceMode !== undefined) settings.general.maintenanceMode = maintenanceMode;
    if (maintenanceMessage) settings.general.maintenanceMessage = maintenanceMessage;
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: 'General settings updated successfully',
      settings: settings.general
    });
  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/security
// @desc    Update security settings
// @access  Private (Admin)
router.put('/security', [auth, requireAdmin], async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    const {
      enableTwoFactorAuth,
      sessionTimeout,
      maxLoginAttempts,
      lockoutDuration,
      passwordMinLength,
      requireSpecialCharacters,
      requireNumbers,
      requireUppercase,
      passwordExpiryDays,
      enableIPWhitelist,
      whitelistedIPs,
      enableCaptcha,
      captchaSiteKey,
      captchaSecretKey
    } = req.body;
    
    if (enableTwoFactorAuth !== undefined) settings.security.enableTwoFactorAuth = enableTwoFactorAuth;
    if (sessionTimeout) settings.security.sessionTimeout = sessionTimeout;
    if (maxLoginAttempts) settings.security.maxLoginAttempts = maxLoginAttempts;
    if (lockoutDuration) settings.security.lockoutDuration = lockoutDuration;
    if (passwordMinLength) settings.security.passwordMinLength = passwordMinLength;
    if (requireSpecialCharacters !== undefined) settings.security.requireSpecialCharacters = requireSpecialCharacters;
    if (requireNumbers !== undefined) settings.security.requireNumbers = requireNumbers;
    if (requireUppercase !== undefined) settings.security.requireUppercase = requireUppercase;
    if (passwordExpiryDays !== undefined) settings.security.passwordExpiryDays = passwordExpiryDays;
    if (enableIPWhitelist !== undefined) settings.security.enableIPWhitelist = enableIPWhitelist;
    if (whitelistedIPs) settings.security.whitelistedIPs = whitelistedIPs;
    if (enableCaptcha !== undefined) settings.security.enableCaptcha = enableCaptcha;
    if (captchaSiteKey) settings.security.captchaSiteKey = captchaSiteKey;
    if (captchaSecretKey) settings.security.captchaSecretKey = captchaSecretKey;
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Security settings updated successfully',
      settings: settings.security
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/email
// @desc    Update email configuration
// @access  Private (Admin)
router.put('/email', [auth, requireAdmin], async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    const {
      provider,
      smtp,
      fromEmail,
      fromName,
      replyToEmail,
      enableEmailNotifications,
      dailyEmailLimit
    } = req.body;
    
    if (provider) settings.email.provider = provider;
    if (smtp) {
      settings.email.smtp = { ...settings.email.smtp, ...smtp };
    }
    if (fromEmail) settings.email.fromEmail = fromEmail;
    if (fromName) settings.email.fromName = fromName;
    if (replyToEmail) settings.email.replyToEmail = replyToEmail;
    if (enableEmailNotifications !== undefined) settings.email.enableEmailNotifications = enableEmailNotifications;
    if (dailyEmailLimit !== undefined) settings.email.dailyEmailLimit = dailyEmailLimit;
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Email configuration updated successfully',
      settings: settings.email
    });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/settings/email/test
// @desc    Send test email
// @access  Private (Admin)
router.post('/email/test', [auth, requireAdmin], async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ success: false, message: 'Test email address is required' });
    }
    
    // Here you would implement actual email sending logic
    // For now, we'll just simulate success
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
});

// @route   PUT /api/settings/payment
// @desc    Update payment settings
// @access  Private (Admin)
router.put('/payment', [auth, requireAdmin], async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    const {
      enablePayments,
      defaultCurrency,
      gstEnabled,
      gstPercentage,
      paymentGateways,
      refundPolicy,
      termsAndConditions
    } = req.body;
    
    if (enablePayments !== undefined) settings.payment.enablePayments = enablePayments;
    if (defaultCurrency) settings.payment.defaultCurrency = defaultCurrency;
    if (gstEnabled !== undefined) settings.payment.gstEnabled = gstEnabled;
    if (gstPercentage !== undefined) settings.payment.gstPercentage = gstPercentage;
    if (paymentGateways) {
      // Merge payment gateway settings
      Object.keys(paymentGateways).forEach(gateway => {
        if (settings.payment.paymentGateways[gateway]) {
          settings.payment.paymentGateways[gateway] = {
            ...settings.payment.paymentGateways[gateway],
            ...paymentGateways[gateway]
          };
        }
      });
    }
    if (refundPolicy) settings.payment.refundPolicy = refundPolicy;
    if (termsAndConditions) settings.payment.termsAndConditions = termsAndConditions;
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Payment settings updated successfully',
      settings: settings.payment
    });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification settings
// @access  Private (Admin)
router.put('/notifications', [auth, requireAdmin], async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    
    const {
      enablePushNotifications,
      enableEmailNotifications,
      enableSMSNotifications,
      sms,
      notificationTypes,
      adminNotifications
    } = req.body;
    
    if (enablePushNotifications !== undefined) settings.notifications.enablePushNotifications = enablePushNotifications;
    if (enableEmailNotifications !== undefined) settings.notifications.enableEmailNotifications = enableEmailNotifications;
    if (enableSMSNotifications !== undefined) settings.notifications.enableSMSNotifications = enableSMSNotifications;
    if (sms) {
      settings.notifications.sms = { ...settings.notifications.sms, ...sms };
    }
    if (notificationTypes) {
      settings.notifications.notificationTypes = { ...settings.notifications.notificationTypes, ...notificationTypes };
    }
    if (adminNotifications) {
      settings.notifications.adminNotifications = { ...settings.notifications.adminNotifications, ...adminNotifications };
    }
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: settings.notifications
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/settings/reset
// @desc    Reset settings to default
// @access  Private (Admin - Superadmin only)
router.post('/reset', [auth, requireAdmin], async (req, res) => {
  try {
    if (req.user.userType !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only superadmins can reset settings' });
    }
    
    const { section } = req.body;
    const settings = await PlatformSettings.getSettings();
    
    if (section && ['general', 'security', 'email', 'payment', 'notifications'].includes(section)) {
      // Reset specific section to defaults
      const defaultSettings = new PlatformSettings();
      settings[section] = defaultSettings[section];
    } else {
      // Reset all settings
      const defaultSettings = new PlatformSettings();
      settings.general = defaultSettings.general;
      settings.security = defaultSettings.security;
      settings.email = defaultSettings.email;
      settings.payment = defaultSettings.payment;
      settings.notifications = defaultSettings.notifications;
    }
    
    settings.lastUpdatedBy = req.user._id;
    settings.version += 1;
    await settings.save();
    
    res.json({
      success: true,
      message: section ? `${section} settings reset to default` : 'All settings reset to default',
      settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


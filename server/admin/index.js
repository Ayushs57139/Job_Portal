const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');

// Apply admin authentication to all routes except test routes and master data routes
router.use((req, res, next) => {
  // Skip auth for test routes and master data routes
  if (req.path.includes('/test/') || req.path.includes('/master-data/')) {
    return next();
  }
  return adminAuth(req, res, next);
});

// Import all admin route modules
router.use('/', require('./dashboard'));
router.use('/users', require('./users'));
router.use('/jobs', require('./jobs'));
router.use('/applications', require('./applications'));
router.use('/packages', require('./packages'));
router.use('/email-templates', require('./email-templates'));
router.use('/email-logs', require('./email-logs'));
router.use('/master-data', require('./master-data'));
router.use('/roles', require('./roles'));
router.use('/team-limits', require('./team-limits'));
router.use('/settings', require('./settings'));
router.use('/comments', require('./comments'));

module.exports = router;


/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors
 * This prevents unhandled promise rejections in route handlers
 */

const logger = require('./logger');

/**
 * Wraps an async function to catch errors and pass them to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    // If the function returns a promise, catch any errors
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error before passing to error handler
      logger.error('Unhandled error in route handler', error, {
        url: req.originalUrl || req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
      });
      // Pass to error handler middleware
      next(error);
    });
  };
};

module.exports = asyncHandler;


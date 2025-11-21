/**
 * Production Environment Validation
 * Checks for required environment variables and configuration
 */

const logger = require('./logger');

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

/**
 * Recommended environment variables for production
 */
const RECOMMENDED_ENV_VARS = [
  'CORS_ORIGINS',
  'JWT_EXPIRE',
  'PORT'
];

/**
 * Validate production environment
 */
const validateProductionEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];
  const warnings = [];

  // Check required variables
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check recommended variables (only warn in production)
  if (isProduction) {
    RECOMMENDED_ENV_VARS.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(varName);
      }
    });
  }

  // Log missing required variables
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', {
      missing,
      environment: process.env.NODE_ENV || 'development'
    });
    return false;
  }

  // Log warnings for recommended variables
  if (warnings.length > 0) {
    logger.warn('Missing recommended environment variables:', {
      warnings,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // Validate JWT_SECRET strength in production
  if (isProduction && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      logger.warn('JWT_SECRET is too short. Use at least 32 characters for production.', {
        length: process.env.JWT_SECRET.length
      });
    }
    if (process.env.JWT_SECRET === 'fallback-secret') {
      logger.error('JWT_SECRET is using default fallback value. This is insecure for production!');
      return false;
    }
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
        !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      logger.error('Invalid MONGODB_URI format');
      return false;
    }
  }

  return true;
};

/**
 * Get environment status
 */
const getEnvironmentStatus = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    port: process.env.PORT || 5000,
    hasMongoDB: !!process.env.MONGODB_URI,
    hasJWTSecret: !!process.env.JWT_SECRET,
    hasCorsOrigins: !!process.env.CORS_ORIGINS,
    isValid: validateProductionEnvironment()
  };
};

module.exports = {
  validateProductionEnvironment,
  getEnvironmentStatus,
  REQUIRED_ENV_VARS,
  RECOMMENDED_ENV_VARS
};


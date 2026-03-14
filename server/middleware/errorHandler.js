/**
 * Centralized Error Handling Middleware
 * Handles all errors in the application with proper logging and response formatting
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Build error context for logging
  const errorContext = {
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    ...(req.user && { 
      userId: req.user._id?.toString(), 
      userEmail: req.user.email 
    }),
    ...(req.body && Object.keys(req.body).length > 0 && { 
      requestBody: JSON.stringify(req.body).substring(0, 500) 
    }),
    ...(req.query && Object.keys(req.query).length > 0 && { 
      queryParams: req.query 
    }),
    ...(req.params && Object.keys(req.params).length > 0 && { 
      routeParams: req.params 
    })
  };

  // Log error with structured logging
  logger.error(
    `Error in ${req.method} ${req.originalUrl || req.url}`,
    err,
    errorContext
  );

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = {
      message,
      statusCode: 404,
      name: 'CastError'
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      statusCode: 400,
      code: 11000
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message).join(', ') || 'Validation failed';
    error = {
      message,
      statusCode: 400,
      name: 'ValidationError'
    };
  }

  // Mongoose connection errors
  if (err.name === 'MongoServerError' || err.name === 'MongoNetworkError') {
    const message = 'Database connection error. Please try again later.';
    error = {
      message,
      statusCode: 503,
      name: err.name
    };
    logger.error('Database connection error', err, errorContext);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      name: 'JsonWebTokenError'
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      name: 'TokenExpiredError'
    };
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = {
      message,
      statusCode: 400,
      name: 'MulterError'
    };
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      message: 'Invalid JSON in request body',
      statusCode: 400,
      name: 'SyntaxError'
    };
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
    error = {
      message: 'Service temporarily unavailable',
      statusCode: 503,
      name: 'NetworkError'
    };
    logger.error('Network error detected', err, errorContext);
  }

  // File system errors
  if (err.code === 'ENOENT' || err.code === 'EACCES' || err.code === 'EMFILE') {
    error = {
      message: 'File system error occurred',
      statusCode: 500,
      name: 'FileSystemError'
    };
    logger.error('File system error', err, errorContext);
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT' || err.message && err.message.includes('timeout')) {
    error = {
      message: 'Request timeout. Please try again.',
      statusCode: 408,
      name: 'TimeoutError'
    };
  }

  // Memory errors
  if (err.message && (err.message.includes('heap') || err.message.includes('memory') || err.code === 'ERR_OUT_OF_MEMORY')) {
    error = {
      message: 'Server is experiencing high load. Please try again later.',
      statusCode: 503,
      name: 'MemoryError'
    };
    logger.error('Memory error detected - server may need restart', err, {
      ...errorContext,
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    });
  }

  // Socket.IO errors
  if (err.name === 'SocketError' || err.message && err.message.includes('socket')) {
    error = {
      message: 'Connection error. Please refresh and try again.',
      statusCode: 503,
      name: 'SocketError'
    };
  }

  // Generic server errors
  if (!error.statusCode && !err.statusCode) {
    error.statusCode = 500;
  }

  // Send error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, don't expose internal error details for 5xx errors
  const response = {
    success: false,
    message: isProduction && statusCode >= 500 
      ? 'An internal server error occurred. Please try again later.'
      : (error.message || err.message || 'Server Error'),
    ...(isDevelopment && { 
      stack: error.stack || err.stack,
      originalError: err.message,
      errorType: err.name || 'UnknownError',
      errorCode: err.code,
      ...(errorContext && { context: errorContext })
    }),
    // Include error code in production for client-side handling
    ...(isProduction && statusCode < 500 && {
      errorCode: err.code || err.name
    })
  };

  // Don't send response if headers already sent
  if (!res.headersSent) {
    res.status(statusCode).json(response);
  } else {
    logger.error('Headers already sent, cannot send error response', err, errorContext);
    // Try to end the response if possible
    if (!res.finished) {
      try {
        res.end();
      } catch (endError) {
        logger.error('Error ending response', endError);
      }
    }
  }
};

module.exports = errorHandler;


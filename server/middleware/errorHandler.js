/**
 * Centralized Error Handling Middleware
 * Handles all errors in the application with proper logging and response formatting
 */

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error with context
  console.error('='.repeat(80));
  console.error('ERROR OCCURRED:', new Date().toISOString());
  console.error('URL:', req.originalUrl);
  console.error('Method:', req.method);
  console.error('Error Message:', err.message);
  console.error('Stack Trace:', err.stack);
  
  // Log additional context if available
  if (req.user) {
    console.error('User:', req.user._id, req.user.email);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.error('Request Body:', JSON.stringify(req.body).substring(0, 500));
  }
  console.error('='.repeat(80));

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
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      statusCode: 400,
      code: 11000
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      name: 'ValidationError'
    };
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

  // Send error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      originalError: err.message 
    })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;


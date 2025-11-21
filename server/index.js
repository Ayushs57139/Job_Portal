const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import utilities
const ensureLogsDir = require('./utils/ensureLogsDir');
ensureLogsDir(); // Ensure logs directory exists before importing logger
const logger = require('./utils/logger');
const asyncHandler = require('./utils/asyncHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, use CORS_ORIGINS environment variable
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : [];
      
      // Allow localhost in production only for health checks and admin access
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // If no CORS_ORIGINS set, allow all (not recommended for production)
      if (allowedOrigins.length === 0) {
        console.warn('⚠️  WARNING: CORS_ORIGINS not set in production. Allowing all origins.');
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    } else {
      // Development: Allow all localhost origins and common development ports
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
        return callback(null, true);
      }
      // Allow all origins in development
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting (skip OPTIONS requests for CORS preflight)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for OPTIONS requests
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the web directory
app.use(express.static('../web'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enhanced logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Custom morgan format for production
  morgan.token('custom', (req, res) => {
    return `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`;
  });
  app.use(morgan('custom', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  
  next();
});

// MongoDB connection
const connectDB = require('./config/database');
connectDB();

// Import error handler middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobseeker', require('./routes/jobseekerAuth'));
app.use('/api/consultancy', require('./routes/consultancyAuth'));
app.use('/api/company', require('./routes/companyAuth'));
app.use('/api/chat', require('./routes/chat'));

// Public packages endpoint (no authentication required)
app.get('/api/packages', async (req, res) => {
  try {
    const Package = require('./models/Package');
    const { packageType, isActive } = req.query;
    
    const query = {};
    if (packageType) query.packageType = packageType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const packages = await Package.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('-createdBy -updatedBy -__v');
    
    res.json({ success: true, packages });
  } catch (error) {
    console.error('Get public packages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Employer login route - handle employer login requests
app.post('/api/employer/login', async (req, res) => {
  try {
    const { loginId, password, userType, employerType } = req.body;
    
    // Validate required fields
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Login ID and password are required' });
    }
    
    // Import required modules
    const jwt = require('jsonwebtoken');
    const User = require('./models/User');
    
    // Find user by userId, email, or phone
    let user = null;
    
    // Try to find by userId first (format: JW + 8 digits)
    if (loginId.startsWith('JW') && loginId.length === 10) {
      user = await User.findOne({ userId: loginId });
    }
    
    // If not found by userId, try email
    if (!user && loginId.includes('@')) {
      user = await User.findOne({ email: loginId.toLowerCase() });
    }
    
    // If not found by email, try phone number
    if (!user) {
      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = loginId.replace(/[\s\-\(\)]/g, '');
      user = await User.findOne({ phone: cleanPhone });
    }
    
    if (!user) {
      logger.warn('Employer login failed: User not found', {
        loginId: loginId.substring(0, 10) + '***',
        userType: userType,
        employerType: employerType,
        ip: req.ip
      });
      return res.status(400).json({ message: 'No account found with this login ID. Please check your credentials or create a new account' });
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn('Employer login failed: Account deactivated', {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        ip: req.ip
      });
      return res.status(400).json({ message: 'Account is deactivated. Please contact support' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Employer login failed: Incorrect password', {
        userId: user._id,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        ip: req.ip
      });
      return res.status(400).json({ message: 'Incorrect password. Please try again' });
    }

    // Validate employer type
    if (userType === 'employer' && employerType) {
      if (user.userType !== 'employer') {
        return res.status(400).json({ message: 'This account is not an employer account' });
      }
      
      if (user.employerType !== employerType) {
        return res.status(400).json({ 
          message: `This account is a ${user.employerType} account, not a ${employerType} account. Please use the correct login page.` 
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        employerType: user.employerType,
        phone: user.phone,
        profile: user.profile,
        isSubuser: user.isSubuser,
        subuserRole: user.subuserRole,
        subuserPermissions: user.subuserPermissions,
        parentUserId: user.parentUserId
      }
    });
  } catch (error) {
    console.error('Employer login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
app.use('/api/resume', require('./routes/resume'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/logos', require('./routes/logos'));
app.use('/api/logos', require('./routes/logos'));
app.use('/api/bulk', require('./routes/bulkImportExport'));
app.use('/api/sales-enquiry', require('./routes/salesEnquiry'));
app.use('/api/verification', require('./routes/verification')); // Employer verification routes
app.use('/api/subusers', require('./routes/subusers')); // Subuser management routes
app.use('/api/custom-fields', require('./routes/customFields')); // Custom fields management routes
app.use('/api/job-categories', require('./routes/jobCategories')); // Job categories management routes
app.use('/api/institutions', require('./routes/institutions')); // Institution management routes
app.use('/api/job-titles', require('./routes/jobTitles')); // Job titles management routes
app.use('/api/job-roles', require('./routes/jobRoles')); // Job roles management routes
app.use('/api/skills', require('./routes/skills')); // Skills management routes
app.use('/api/user-profiles', require('./routes/userProfiles')); // User profiles management routes
app.use('/api/industries', require('./routes/industries')); // Industries management routes
app.use('/api/departments', require('./routes/departments')); // Departments management routes
app.use('/api/locations', require('./routes/locations')); // Locations management routes
app.use('/api/specializations', require('./routes/specializations')); // Specializations management routes
app.use('/api/courses', require('./routes/courses')); // Courses management routes
app.use('/api/certifications', require('./routes/certifications')); // Certifications management routes
app.use('/api/candidates', require('./routes/candidates')); // Candidates search and management routes
app.use('/api/job-alerts', require('./routes/jobAlerts')); // Job alerts management routes
app.use('/api/freejobwala-chat', require('./routes/freejobwalaChat')); // Freejobwala Chat feature routes
app.use('/api/chatbot', require('./routes/chatbot')); // Chatbot conversations routes
app.use('/api/kyc', require('./routes/kyc')); // KYC document management routes
app.use('/api/advertisements', require('./routes/advertisements')); // Advertisement management routes
app.use('/api/social-updates', require('./routes/socialUpdates')); // Social updates and sharing routes
app.use('/api/saved-jobs', require('./routes/savedJobs')); // Saved jobs management routes
app.use('/api/settings', require('./routes/settings')); // Platform settings management routes
app.use('/api/theme', require('./routes/theme')); // Theme management routes
app.use('/api/upload', require('./routes/upload')); // File upload routes
app.use('/api/popular-searches', require('./routes/popularSearches')); // Popular searches routes

// Public packages route
app.get('/api/packages', async (req, res) => {
  try {
    const Package = require('./models/Package');
    const packageType = req.query.type || '';
    
    let query = { isActive: true };
    if (packageType) {
      query.packageType = packageType;
    }
    
    const packages = await Package.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('-createdBy -updatedBy -createdAt -updatedAt');
    
    res.json({
      success: true,
      packages: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = require('./config/database').getConnectionStatus();
    const healthStatus = {
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbStatus.isConnected,
        state: dbStatus.state,
        host: dbStatus.host
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    // Return 503 if database is not connected
    const statusCode = dbStatus.isConnected ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check error', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// Favicon endpoints to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end(); // No content
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  logger.warn(`API route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.status(404).json({ 
    success: false,
    message: 'API route not found',
    path: req.originalUrl 
  });
});

// 404 handler for non-API routes (SPA fallback)
// This handles client-side routing for production deployments
app.use('*', (req, res) => {
  // If it's an API request that wasn't caught, return JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      message: 'API route not found',
      path: req.originalUrl 
    });
  }
  
  // For non-API routes, check if it's a static file request
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    // Static file not found
    logger.warn(`Static file not found: ${req.originalUrl}`);
    return res.status(404).json({ 
      success: false,
      message: 'Resource not found' 
    });
  }
  
  // For SPA routing, serve index.html if it exists
  // This allows client-side routing to work on refresh
  const webPath = path.join(__dirname, '../web');
  const indexPath = path.join(webPath, 'index.html');
  
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    logger.debug(`Serving index.html for SPA route: ${req.originalUrl}`);
    return res.sendFile(indexPath);
  }
  
  // Fallback: return 404 JSON
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware (must be after all routes and 404 handler)
app.use(errorHandler);

// WebSocket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn('WebSocket connection rejected: No token provided', {
        ip: socket.handshake.address
      });
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const User = require('./models/User');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      logger.warn('WebSocket connection rejected: Invalid or inactive user', {
        userId: decoded.id,
        ip: socket.handshake.address
      });
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    logger.error('WebSocket authentication error', error, {
      ip: socket.handshake.address,
      errorType: error.name
    });
    next(new Error('Authentication error'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`WebSocket user connected: ${socket.user?.firstName} ${socket.user?.lastName}`, {
    userId: socket.userId,
    userType: socket.user?.userType,
    ip: socket.handshake.address
  });

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Join user to rooms based on their type
  if (socket.user.userType === 'admin' || socket.user.userType === 'superadmin') {
    socket.join('admin_room');
    socket.join('support_room');
  } else if (socket.user.userType === 'employer') {
    if (socket.user.employerType === 'company') {
      socket.join('company_room');
    } else if (socket.user.employerType === 'consultancy') {
      socket.join('consultancy_room');
    }
    socket.join('employer_room');
  } else if (socket.user.userType === 'jobseeker') {
    socket.join('jobseeker_room');
  }

  // Handle joining conversation rooms
  socket.on('join_conversation', (conversationId) => {
    try {
      socket.join(`conversation_${conversationId}`);
      logger.debug(`User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error joining conversation room', error, {
        userId: socket.userId,
        conversationId
      });
    }
  });

  // Handle leaving conversation rooms
  socket.on('leave_conversation', (conversationId) => {
    try {
      socket.leave(`conversation_${conversationId}`);
      logger.debug(`User ${socket.userId} left conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error leaving conversation room', error, {
        userId: socket.userId,
        conversationId
      });
    }
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, replyTo } = data;
      
      if (!conversationId || !content) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }
      
      // Validate conversation access
      const Conversation = require('./models/Conversation');
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.some(p => p.user.toString() === socket.userId);
      if (!isParticipant) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Create message
      const Message = require('./models/Message');
      const message = new Message({
        conversation: conversationId,
        sender: socket.userId,
        content: content.trim(),
        replyTo: replyTo || null
      });

      await message.save();
      await message.populate('sender', 'firstName lastName profile.avatar userType employerType');
      if (replyTo) {
        await message.populate('replyTo', 'content sender');
      }

      // Increment unread count for other participants
      const otherParticipants = conversation.participants.filter(p => p.user.toString() !== socket.userId);
      for (const participant of otherParticipants) {
        await conversation.incrementUnread(participant.user);
      }

      // Emit message to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', {
        message: message,
        conversationId: conversationId
      });

      // Emit notification to other participants
      otherParticipants.forEach(participant => {
        io.to(`user_${participant.user}`).emit('message_notification', {
          conversationId: conversationId,
          message: message,
          unreadCount: conversation.unreadCount.get(participant.user.toString()) || 0
        });
      });

    } catch (error) {
      logger.error('Error handling WebSocket message', error, {
        userId: socket.userId,
        conversationId: data?.conversationId
      });
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    try {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        conversationId: data.conversationId
      });
    } catch (error) {
      logger.error('Error handling typing_start', error, {
        userId: socket.userId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    try {
      socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    } catch (error) {
      logger.error('Error handling typing_stop', error, {
        userId: socket.userId
      });
    }
  });

  // Handle user status updates
  socket.on('update_status', (status) => {
    try {
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        status: status
      });
    } catch (error) {
      logger.error('Error handling status update', error, {
        userId: socket.userId
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    logger.info(`WebSocket user disconnected: ${socket.user?.firstName} ${socket.user?.lastName}`, {
      userId: socket.userId,
      reason: reason
    });
    socket.broadcast.emit('user_offline', {
      userId: socket.userId
    });
  });

  // Handle socket errors
  socket.on('error', (error) => {
    logger.error('Socket error', error, {
      userId: socket.userId,
      errorType: error.name
    });
  });
});

// Handle Socket.IO server errors
io.on('error', (error) => {
  logger.error('Socket.IO server error', error, {
    type: 'socketio_server_error'
  });
});

// Make io available to routes
app.set('io', io);

// Start notification services
const jobNotificationService = require('./services/jobNotificationService');
jobNotificationService.start();

const PORT = process.env.PORT || 5000;

// Global process error handlers - MUST be after server creation
// These handlers prevent the server from crashing on unexpected errors

// Critical errors that should cause shutdown
const CRITICAL_ERRORS = [
  'EADDRINUSE',      // Port already in use
  'EACCES',          // Permission denied
  'ENOTFOUND',       // DNS lookup failed (critical config issue)
  'ECONNREFUSED'     // Critical connection refused (if it's our DB)
];

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION', error, {
    type: 'uncaughtException',
    critical: CRITICAL_ERRORS.includes(error.code)
  });
  
  // Only exit for critical errors
  const isCritical = CRITICAL_ERRORS.includes(error.code) || 
                     error.message.includes('Cannot find module') ||
                     error.message.includes('MODULE_NOT_FOUND');
  
  if (isCritical) {
    logger.error('Critical error detected, shutting down server', error);
    // Close server gracefully
    server.close(() => {
      logger.info('Server closed due to critical uncaught exception');
      process.exit(1);
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced exit after timeout');
      process.exit(1);
    }, 10000);
  } else {
    // Non-critical errors: log and continue
    logger.warn('Non-critical uncaught exception, server will continue running', {
      error: error.message,
      code: error.code
    });
  }
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  
  logger.error('UNHANDLED REJECTION', error, {
    type: 'unhandledRejection',
    promise: promise.toString().substring(0, 200)
  });
  
  // Don't exit on unhandled rejections - log and continue
  // Most unhandled rejections are from async operations that can be recovered
  logger.warn('Unhandled rejection logged, server will continue running');
  
  // In production, you might want to restart the process after too many rejections
  // For now, we'll just log them
});

// SIGTERM handler (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server started successfully on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Accessible at http://localhost:${PORT} and http://0.0.0.0:${PORT}`);
  console.log(`   For Android emulator, use: http://10.0.2.2:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   Freejobwala Chat Feature is active');
});

// Handle server errors
server.on('error', (error) => {
  logger.error('Server error', error, {
    type: 'serverError',
    port: PORT
  });
  
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    logger.error('Server error occurred, attempting to recover...');
  }
});

// Handle client errors
server.on('clientError', (error, socket) => {
  logger.warn('Client error', error, {
    type: 'clientError',
    remoteAddress: socket.remoteAddress
  });
  
  // End the connection gracefully
  if (!socket.destroyed) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
});

module.exports = app;

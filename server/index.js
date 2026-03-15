const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const fs = require('fs');
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

// Rate limiting removed for production - allow unlimited requests from clients

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

// Request monitoring for auto-restart on high load
const requestMonitor = {
  requests: [],
  maxRequestsPerMinute: 50000, // Increased threshold - allow many requests from clients
  windowMs: 60000, // 1 minute window
  restartOnHighLoad: process.env.AUTO_RESTART_ON_HIGH_LOAD !== 'false', // Enable by default
  lastRestartTime: 0,
  minRestartInterval: 300000, // 5 minutes between restarts
  crashCount: 0,
  lastCrashTime: 0,
  maxCrashesPerHour: 10, // Max crashes per hour before alerting
  
  // Clean old requests periodically
  cleanup() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
  },
  
  // Add request timestamp
  addRequest() {
    const now = Date.now();
    this.requests.push(now);
    this.cleanup();
    
    // Check if we need to restart due to high load
    if (this.restartOnHighLoad && this.requests.length > this.maxRequestsPerMinute) {
      const timeSinceLastRestart = now - this.lastRestartTime;
      
      if (timeSinceLastRestart > this.minRestartInterval) {
        logger.warn(`High request load detected: ${this.requests.length} requests in last minute. Auto-restarting server...`, {
          requestCount: this.requests.length,
          threshold: this.maxRequestsPerMinute,
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        });
        
        this.lastRestartTime = now;
        
        // Graceful restart after 2 seconds
        setTimeout(() => {
          logger.info('Initiating graceful server restart due to high load...');
          process.exit(1); // PM2 will auto-restart
        }, 2000);
      } else {
        logger.warn(`High request load detected but restart skipped (too soon since last restart): ${this.requests.length} requests/min`, {
          requestCount: this.requests.length,
          timeSinceLastRestart: Math.round(timeSinceLastRestart / 1000) + 's'
        });
      }
    }
    
    return this.requests.length;
  },
  
  // Track crashes
  recordCrash() {
    const now = Date.now();
    this.crashCount++;
    
    // Reset counter if more than an hour has passed
    if (now - this.lastCrashTime > 3600000) {
      this.crashCount = 1;
    }
    
    this.lastCrashTime = now;
    
    if (this.crashCount > this.maxCrashesPerHour) {
      logger.error(`High crash frequency detected: ${this.crashCount} crashes in the last hour`, {
        crashCount: this.crashCount,
        maxCrashesPerHour: this.maxCrashesPerHour
      });
    }
  },
  
  // Get current request rate
  getRequestRate() {
    this.cleanup();
    return {
      requestsPerMinute: this.requests.length,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      threshold: (this.requests.length / this.maxRequestsPerMinute * 100).toFixed(2) + '%',
      crashCount: this.crashCount
    };
  }
};

// Cleanup old requests every 30 seconds
setInterval(() => {
  requestMonitor.cleanup();
}, 30000);

// Request logging middleware with monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  // Track request for monitoring
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/health')) {
    requestMonitor.addRequest();
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  
  next();
});

// Production environment validation
if (process.env.NODE_ENV === 'production') {
  const { validateProductionEnvironment } = require('./utils/productionCheck');
  const isValid = validateProductionEnvironment();
  if (!isValid) {
    logger.error('Production environment validation failed. Please check your environment variables.');
    logger.error('Server will continue but may not function correctly.');
  } else {
    logger.info('Production environment validated successfully');
  }
}

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
app.use('/api/faqs', require('./routes/faqs')); // FAQ management routes
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/employers', require('./routes/employers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/logos', require('./routes/logos'));
app.use('/api/logos', require('./routes/logos'));
app.use('/api/bulk', require('./routes/bulkImportExport'));
app.use('/api/sales-enquiry', require('./routes/salesEnquiry'));
console.log('[Routes] Sales enquiry routes registered: /api/sales-enquiry (including /simple endpoint)');
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
app.use('/api/connections', require('./routes/connections')); // Connection requests and management
app.use('/api/follows', require('./routes/follows')); // Follow system for companies/consultancies
app.use('/api/comment-suggestions', require('./routes/commentSuggestions')); // Comment suggestions management
app.use('/api/saved-jobs', require('./routes/savedJobs')); // Saved jobs management routes
app.use('/api/settings', require('./routes/settings')); // Platform settings management routes
app.use('/api/theme', require('./routes/theme')); // Theme management routes
app.use('/api/upload', require('./routes/upload')); // File upload routes
app.use('/api/popular-searches', require('./routes/popularSearches')); // Popular searches routes
app.use('/api/job-events', require('./routes/jobEvents')); // Job events management routes
app.use('/api/admin', require('./routes/invitations')); // Bulk invitations and WhatsApp settings routes
app.use('/api/admin/locations', require('./routes/locationManagement')); // Location management routes
app.use('/api/locations', require('./routes/locationManagement')); // Public location routes

// Public packages route
app.get('/api/packages', async (req, res) => {
  try {
    const Package = require('./models/Package');
    // Support both 'type' and 'packageType' query parameters
    const packageType = req.query.packageType || req.query.type || '';
    const isActive = req.query.isActive;
    
    let query = {};
    
    // Only show active packages by default for public endpoint
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      query.isActive = true;
    }
    
    if (packageType) {
      query.packageType = packageType;
    }
    
    const packages = await Package.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('-createdBy -updatedBy -createdAt -updatedAt');
    
    console.log(`Public packages fetch - Type: ${packageType || 'all'}, Total: ${packages.length}`);
    
    res.json({
      success: true,
      packages: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
});

// Health check endpoint with detailed status
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = require('./config/database').getConnectionStatus();
    const memUsage = process.memoryUsage();
    const requestRate = requestMonitor.getRequestRate();
    
    const healthStatus = {
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      uptimeFormatted: formatUptime(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      database: {
        connected: dbStatus.isConnected,
        state: dbStatus.state,
        host: dbStatus.host,
        reconnectAttempts: dbStatus.reconnectAttempts || 0
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
        percentage: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2) + '%'
      },
      requests: {
        requestsPerMinute: requestRate.requestsPerMinute,
        maxRequestsPerMinute: requestRate.maxRequestsPerMinute,
        threshold: requestRate.threshold,
        crashCount: requestRate.crashCount || 0
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Return 503 if database is not connected
    const statusCode = dbStatus.isConnected ? 200 : 503;
    if (!dbStatus.isConnected) {
      healthStatus.status = 'DEGRADED';
      healthStatus.message = 'Server is running but database is disconnected';
    }
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check error', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

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
// This handles client-side routing for production deployments - fixes 404 on hard refresh
app.use('*', (req, res, next) => {
  try {
    // If it's an API request that wasn't caught, return JSON
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ 
        success: false,
        message: 'API route not found',
        path: req.originalUrl 
      });
    }
    
    // Skip static file requests (they should be handled by express.static)
    const ext = path.extname(req.path);
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt', '.pdf', '.zip', '.map'];
    if (ext && staticExtensions.includes(ext.toLowerCase())) {
      // Static file not found - return 404
      logger.debug(`Static file not found: ${req.originalUrl}`);
      return res.status(404).json({ 
        success: false,
        message: 'Resource not found' 
      });
    }
    
    // For SPA routing, serve index.html for all non-API, non-static routes
    // This allows client-side routing to work on refresh (fixes 404 on hard refresh)
    const possibleWebPaths = [
      path.join(__dirname, '../web'),
      path.join(__dirname, '../build'),
      path.join(__dirname, '../dist'),
      path.join(__dirname, '../public'),
      path.join(__dirname, '..'), // Root directory
      path.join(__dirname, '../../web'), // Alternative path
      path.join(__dirname, '../../build'), // Alternative path
      path.join(__dirname, '../../dist') // Alternative path
    ];
    
    let indexPath = null;
    for (const webPath of possibleWebPaths) {
      try {
        const testPath = path.join(webPath, 'index.html');
        if (fs.existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      } catch (err) {
        // Continue to next path if this one fails
        continue;
      }
    }
    
    if (indexPath) {
      logger.debug(`Serving index.html for SPA route: ${req.originalUrl}`);
      // Set proper content type
      res.setHeader('Content-Type', 'text/html');
      return res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error('Error serving index.html', err, {
            path: indexPath,
            originalUrl: req.originalUrl
          });
          // Fall through to 404 response
          return res.status(404).json({ 
            success: false,
            message: 'Route not found',
            path: req.originalUrl 
          });
        }
      });
    }
    
    // Fallback: return 404 JSON
    logger.warn(`Route not found and no index.html found: ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    res.status(404).json({ 
      success: false,
      message: 'Route not found',
      path: req.originalUrl 
    });
  } catch (error) {
    // Error handling for the 404 handler itself
    logger.error('Error in 404 handler', error, {
      originalUrl: req.originalUrl
    });
    next(error); // Pass to error handler middleware
  }
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

  // ── Chatbot socket events ──────────────────────────────────────────────────

  // User joins their chatbot session room (called from ChatbotWidget)
  socket.on('join_chatbot_session', (sessionId) => {
    socket.join(`chatbot_${sessionId}`);
  });

  // Admin joins a chatbot session to monitor/reply
  socket.on('admin_join_chatbot', (sessionId) => {
    if (socket.user?.userType === 'admin' || socket.user?.userType === 'superadmin') {
      socket.join(`chatbot_${sessionId}`);
    }
  });

  // Admin sends a message directly to a chatbot session
  socket.on('admin_chatbot_message', async (data) => {
    try {
      const { sessionId, message } = data;
      if (!sessionId || !message) return;
      const ChatbotConversation = require('./models/ChatbotConversation');
      const conversation = await ChatbotConversation.findOne({ sessionId });
      if (!conversation) return;
      await conversation.addMessage('bot', message);
      io.to(`chatbot_${sessionId}`).emit('chatbot_admin_message', {
        sessionId, message, sender: 'bot', timestamp: new Date()
      });
    } catch (err) {
      logger.error('admin_chatbot_message error', err);
    }
  });

  // Typing indicators for chatbot
  socket.on('chatbot_typing_start', (sessionId) => {
    socket.to(`chatbot_${sessionId}`).emit('chatbot_admin_typing', { sessionId });
  });
  socket.on('chatbot_typing_stop', (sessionId) => {
    socket.to(`chatbot_${sessionId}`).emit('chatbot_admin_stopped_typing', { sessionId });
  });

  // ── End chatbot socket events ──────────────────────────────────────────────

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
// These handlers prevent the server from crashing on unexpected errors and enable auto-restart

// Critical errors that should cause shutdown (PM2 will auto-restart)
const CRITICAL_ERRORS = [
  'EADDRINUSE',      // Port already in use
  'EACCES',          // Permission denied
  'ENOTFOUND',       // DNS lookup failed (critical config issue)
  'ECONNREFUSED'     // Critical connection refused (if it's our DB)
];

// Track error frequency for debugging
let errorCount = 0;
let lastErrorTime = Date.now();
const ERROR_RESET_INTERVAL = 3600000; // 1 hour

process.on('uncaughtException', (error) => {
  errorCount++;
  const now = Date.now();
  
  // Reset error count if more than an hour has passed
  if (now - lastErrorTime > ERROR_RESET_INTERVAL) {
    errorCount = 1;
  }
  lastErrorTime = now;
  
  requestMonitor.recordCrash();
  
  logger.error('UNCAUGHT EXCEPTION', error, {
    type: 'uncaughtException',
    critical: CRITICAL_ERRORS.includes(error.code),
    errorCount: errorCount,
    memoryUsage: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
    },
    uptime: Math.round(process.uptime()) + 's'
  });
  
  // Only exit for critical errors (PM2 will auto-restart)
  const isCritical = CRITICAL_ERRORS.includes(error.code) || 
                     error.message.includes('Cannot find module') ||
                     error.message.includes('MODULE_NOT_FOUND') ||
                     error.message.includes('EADDRINUSE');
  
  if (isCritical) {
    logger.error('Critical error detected, shutting down server (PM2 will auto-restart)', error);
    // Close server gracefully
    server.close(() => {
      logger.info('Server closed due to critical uncaught exception. PM2 will restart automatically.');
      process.exit(1); // PM2 will catch this and restart
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('Forced exit after timeout. PM2 will restart automatically.');
      process.exit(1); // PM2 will catch this and restart
    }, 10000);
  } else {
    // Non-critical errors: log and continue (don't crash)
    logger.warn('Non-critical uncaught exception, server will continue running', {
      error: error.message,
      code: error.code,
      errorCount: errorCount
    });
    // Don't exit - let the server continue running
  }
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  
  errorCount++;
  const now = Date.now();
  
  // Reset error count if more than an hour has passed
  if (now - lastErrorTime > ERROR_RESET_INTERVAL) {
    errorCount = 1;
  }
  lastErrorTime = now;
  
  logger.error('UNHANDLED REJECTION', error, {
    type: 'unhandledRejection',
    promise: promise.toString().substring(0, 200),
    errorCount: errorCount,
    memoryUsage: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
  
  // Don't exit on unhandled rejections - log and continue
  // Most unhandled rejections are from async operations that can be recovered
  logger.warn('Unhandled rejection logged, server will continue running');
  
  // If too many unhandled rejections, consider restarting (PM2 will handle it)
  if (errorCount > 100) {
    logger.error('Too many errors detected, initiating restart (PM2 will auto-restart)', {
      errorCount: errorCount
    });
    setTimeout(() => {
      process.exit(1); // PM2 will catch this and restart
    }, 5000);
  }
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
  const memUsage = process.memoryUsage();
  logger.info(`Server started successfully on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid,
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
    },
    timestamp: new Date().toISOString()
  });
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Accessible at http://localhost:${PORT} and http://0.0.0.0:${PORT}`);
  console.log(`   For Android emulator, use: http://10.0.2.2:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Process ID: ${process.pid}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
  console.log('   Freejobwala Chat Feature is active');
  console.log('   Auto-restart enabled: Server will automatically restart on crashes');
  console.log('   High-load monitoring: Server will restart if request load is too high');
  console.log('   Health check: http://localhost:' + PORT + '/api/health');
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

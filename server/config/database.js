const mongoose = require('mongoose');
const logger = require('../utils/logger');

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 seconds
let isConnecting = false;
let connectionState = 'disconnected'; // disconnected, connecting, connected

const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    logger.debug('Database connection already in progress, skipping...');
    return;
  }

  if (connectionState === 'connected') {
    logger.debug('Database already connected');
    return;
  }

  isConnecting = true;
  connectionState = 'connecting';

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 10000, // 10 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoUri, options);

    connectionState = 'connected';
    isConnecting = false;
    reconnectAttempts = 0; // Reset counter on successful connection

    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      host: conn.connection.host,
      name: conn.connection.name,
      readyState: conn.connection.readyState
    });
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      connectionState = 'disconnected';
      logger.warn('MongoDB disconnected', {
        timestamp: new Date().toISOString(),
        readyState: mongoose.connection.readyState
      });
      
      // Only attempt reconnect if not already connecting
      if (!isConnecting) {
        attemptReconnect();
      }
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', err, {
        readyState: mongoose.connection.readyState,
        errorCode: err.code
      });
      
      // Don't exit on connection errors - let reconnection handle it
      connectionState = 'disconnected';
      isConnecting = false;
    });

    mongoose.connection.on('reconnected', () => {
      connectionState = 'connected';
      reconnectAttempts = 0;
      logger.info('MongoDB reconnected successfully', {
        timestamp: new Date().toISOString(),
        host: mongoose.connection.host
      });
    });

    mongoose.connection.on('connecting', () => {
      connectionState = 'connecting';
      logger.info('MongoDB connecting...', {
        host: mongoose.connection.host
      });
    });

  } catch (error) {
    connectionState = 'disconnected';
    isConnecting = false;
    
    logger.error('Database connection error', error, {
      attempt: reconnectAttempts + 1,
      maxAttempts: MAX_RECONNECT_ATTEMPTS
    });
    
    // Attempt reconnection if connection fails initially
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        attemptReconnect();
      }, RECONNECT_DELAY);
    } else {
      logger.error('Initial database connection failed after max attempts', error);
      // Don't exit - let the app continue and retry later
      // The app can still function with degraded functionality
    }
  }
};

const attemptReconnect = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error('Max reconnection attempts reached. Server will continue but database operations may fail.', {
      maxAttempts: MAX_RECONNECT_ATTEMPTS
    });
    // Don't exit - let server continue running
    // Applications can handle database unavailability gracefully
    return;
  }

  reconnectAttempts++;
  logger.info(`Attempting to reconnect to MongoDB (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`, {
    attempt: reconnectAttempts,
    maxAttempts: MAX_RECONNECT_ATTEMPTS
  });

  try {
    await connectDB();
  } catch (error) {
    logger.error(`Reconnection attempt ${reconnectAttempts} failed`, error, {
      attempt: reconnectAttempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS
    });
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      // Exponential backoff
      const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 60000);
      logger.info(`Retrying in ${delay}ms...`);
      setTimeout(() => {
        attemptReconnect();
      }, delay);
    } else {
      logger.error('All reconnection attempts exhausted. Server will continue but database is unavailable.', {
        maxAttempts: MAX_RECONNECT_ATTEMPTS
      });
      // Don't exit - let server continue
    }
  }
};

// Health check function
const getConnectionStatus = () => {
  return {
    state: connectionState,
    readyState: mongoose.connection.readyState,
    isConnected: mongoose.connection.readyState === 1,
    reconnectAttempts,
    host: mongoose.connection.host || 'unknown'
  };
};

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;

/**
 * Logger Utility
 * Provides structured logging with file output and console output
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');
const debugLogPath = path.join(logsDir, 'debug.log');

/**
 * Format log entry
 */
const formatLogEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
};

/**
 * Write to log file
 */
const writeToFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content, { encoding: 'utf8' });
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
};

/**
 * Logger class
 */
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log error
   */
  error(message, error = null, meta = {}) {
    const errorDetails = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...meta
    } : meta;

    const logEntry = formatLogEntry('ERROR', message, errorDetails);
    
    // Always write to error log
    writeToFile(errorLogPath, logEntry);
    writeToFile(combinedLogPath, logEntry);

    // Console output
    console.error('❌ ERROR:', message);
    if (error) {
      console.error('   Name:', error.name);
      console.error('   Message:', error.message);
      if (this.isDevelopment) {
        console.error('   Stack:', error.stack);
      }
    }
    if (Object.keys(meta).length > 0) {
      console.error('   Meta:', JSON.stringify(meta, null, 2));
    }
  }

  /**
   * Log warning
   */
  warn(message, meta = {}) {
    const logEntry = formatLogEntry('WARN', message, meta);
    writeToFile(combinedLogPath, logEntry);
    
    console.warn('⚠️  WARN:', message);
    if (Object.keys(meta).length > 0 && this.isDevelopment) {
      console.warn('   Meta:', JSON.stringify(meta, null, 2));
    }
  }

  /**
   * Log info
   */
  info(message, meta = {}) {
    const logEntry = formatLogEntry('INFO', message, meta);
    writeToFile(combinedLogPath, logEntry);
    
    console.log('ℹ️  INFO:', message);
    if (Object.keys(meta).length > 0 && this.isDevelopment) {
      console.log('   Meta:', JSON.stringify(meta, null, 2));
    }
  }

  /**
   * Log debug (only in development)
   */
  debug(message, meta = {}) {
    if (this.isDevelopment) {
      const logEntry = formatLogEntry('DEBUG', message, meta);
      writeToFile(debugLogPath, logEntry);
      writeToFile(combinedLogPath, logEntry);
      
      console.log('🔍 DEBUG:', message);
      if (Object.keys(meta).length > 0) {
        console.log('   Meta:', JSON.stringify(meta, null, 2));
      }
    }
  }

  /**
   * Log HTTP request
   */
  http(req, res, responseTime = null) {
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      ...(responseTime && { responseTime: `${responseTime}ms` })
    };

    const logEntry = formatLogEntry('HTTP', `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`, meta);
    writeToFile(combinedLogPath, logEntry);

    if (this.isDevelopment) {
      console.log(`📡 ${req.method} ${req.originalUrl || req.url} ${res.statusCode}${responseTime ? ` (${responseTime}ms)` : ''}`);
    }
  }

  /**
   * Log database operations
   */
  db(operation, details = {}) {
    const message = `DB ${operation}`;
    const logEntry = formatLogEntry('DB', message, details);
    writeToFile(combinedLogPath, logEntry);
    
    if (this.isDevelopment) {
      console.log(`🗄️  ${message}`, Object.keys(details).length > 0 ? details : '');
    }
  }
}

// Export singleton instance
module.exports = new Logger();


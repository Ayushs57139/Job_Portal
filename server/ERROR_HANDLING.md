# Error Handling & Debugging Guide

This document describes the comprehensive error handling and debugging system implemented in the JobWala server.

## Overview

The server now includes:
- ✅ Comprehensive error handling that prevents crashes
- ✅ File-based logging system
- ✅ Enhanced 404 handling for SPA routing
- ✅ Database connection resilience
- ✅ WebSocket error handling
- ✅ Request/response logging
- ✅ Health check endpoint

## Error Handling Strategy

### 1. Non-Critical Errors
Most errors are logged but **do not crash the server**. The server continues running and can recover from:
- Database connection issues (with automatic reconnection)
- Unhandled promise rejections
- Non-critical uncaught exceptions
- Route errors
- WebSocket errors

### 2. Critical Errors
Only critical errors cause the server to shut down:
- Port already in use (EADDRINUSE)
- Permission denied (EACCES)
- Missing critical modules (MODULE_NOT_FOUND)
- DNS lookup failures (ENOTFOUND)

## Logging System

### Log Files
All logs are written to `server/logs/`:
- `error.log` - All error-level logs
- `combined.log` - All logs (info, warn, error, debug)
- `debug.log` - Debug logs (development only)

### Log Levels
- **ERROR**: Critical errors that need attention
- **WARN**: Warning messages (non-critical issues)
- **INFO**: General information (server start, connections)
- **DEBUG**: Detailed debugging information (development only)
- **HTTP**: HTTP request/response logging

### Using the Logger
```javascript
const logger = require('./utils/logger');

// Log errors
logger.error('Something went wrong', error, { context: 'additional info' });

// Log warnings
logger.warn('Potential issue', { details: 'info' });

// Log info
logger.info('Server started', { port: 5000 });

// Log debug (development only)
logger.debug('Debug information', { data: 'value' });
```

## Error Handler Middleware

The error handler middleware (`server/middleware/errorHandler.js`) automatically:
- Logs all errors with context
- Formats error responses
- Handles specific error types (Mongoose, JWT, Multer, etc.)
- Prevents duplicate error responses

### Error Types Handled
- **CastError**: Invalid MongoDB ObjectId
- **ValidationError**: Mongoose validation errors
- **Duplicate Key (11000)**: Unique constraint violations
- **JWT Errors**: Invalid/expired tokens
- **Multer Errors**: File upload errors
- **MongoDB Connection Errors**: Database connectivity issues
- **Network Errors**: Connection refused/timeout
- **Syntax Errors**: Malformed JSON

## Async Route Handler Wrapper

Use `asyncHandler` to automatically catch errors in async route handlers:

```javascript
const asyncHandler = require('../utils/asyncHandler');

router.get('/example', asyncHandler(async (req, res) => {
  // Your async code here
  // Errors are automatically caught and passed to error handler
  const data = await someAsyncOperation();
  res.json(data);
}));
```

## Database Connection Handling

The database connection system:
- Automatically reconnects on disconnection
- Uses exponential backoff for reconnection attempts
- Does not exit the server on connection failures
- Provides connection status via health check

### Connection States
- `disconnected`: Not connected
- `connecting`: Connection in progress
- `connected`: Successfully connected

## 404 Error Handling

### API Routes
API routes that don't exist return:
```json
{
  "success": false,
  "message": "API route not found",
  "path": "/api/nonexistent"
}
```

### SPA Routing
For non-API routes (client-side routing):
- If `web/index.html` exists, it's served (allows client-side routing)
- Otherwise, returns 404 JSON response

This fixes the issue where refreshing the page on a client route would show 404.

## Health Check Endpoint

Check server health at `/api/health`:

```bash
curl http://localhost:5000/api/health
```

Response includes:
- Server status
- Database connection status
- Uptime
- Memory usage
- Environment

## WebSocket Error Handling

All WebSocket operations are wrapped in try-catch blocks:
- Connection errors are logged
- Authentication errors are logged
- Message sending errors are handled gracefully
- Socket errors don't crash the server

## Debugging Tips

### 1. Check Log Files
```bash
# View error log
tail -f server/logs/error.log

# View all logs
tail -f server/logs/combined.log

# View debug log (development)
tail -f server/logs/debug.log
```

### 2. Enable Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error stack traces in responses
- Debug logging
- More verbose console output

### 3. Monitor Health Endpoint
```bash
# Check server health
curl http://localhost:5000/api/health | jq
```

### 4. Common Issues

#### Server Restarts on Errors
- **Fixed**: Server now only restarts on critical errors
- Non-critical errors are logged and the server continues

#### 404 on Page Refresh
- **Fixed**: SPA routing now works correctly
- The server serves `index.html` for non-API routes

#### Database Connection Issues
- **Fixed**: Automatic reconnection with exponential backoff
- Server continues running even if database is temporarily unavailable

## Best Practices

1. **Always use asyncHandler for async routes**
   ```javascript
   router.get('/route', asyncHandler(async (req, res) => {
     // async code
   }));
   ```

2. **Use logger instead of console.log**
   ```javascript
   logger.info('Message', { context: 'data' });
   ```

3. **Handle errors in try-catch blocks**
   ```javascript
   try {
     await operation();
   } catch (error) {
     logger.error('Operation failed', error);
     // Handle error appropriately
   }
   ```

4. **Check database connection before operations**
   ```javascript
   const dbStatus = require('./config/database').getConnectionStatus();
   if (!dbStatus.isConnected) {
     return res.status(503).json({ message: 'Database unavailable' });
   }
   ```

## Production Considerations

1. **Log Rotation**: Consider implementing log rotation for production
2. **Monitoring**: Set up monitoring for error rates
3. **Alerts**: Configure alerts for critical errors
4. **Rate Limiting**: Already implemented via express-rate-limit
5. **Health Checks**: Use `/api/health` for load balancer health checks

## Troubleshooting

### Server Keeps Restarting
- Check `server/logs/error.log` for critical errors
- Verify database connection string
- Check port availability

### 404 Errors on Refresh
- Ensure `web/index.html` exists
- Check that static file serving is configured
- Verify route handlers are registered before 404 handler

### Database Connection Issues
- Check MongoDB URI in environment variables
- Verify network connectivity
- Check MongoDB server status
- Review `server/logs/error.log` for connection errors

### High Memory Usage
- Monitor via `/api/health` endpoint
- Check for memory leaks in routes
- Review log file sizes

## Support

For issues:
1. Check `server/logs/error.log`
2. Review health check endpoint
3. Check database connection status
4. Review recent changes in code


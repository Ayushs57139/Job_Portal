# Production Deployment Checklist

This checklist ensures your application is ready for production deployment.

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set `NODE_ENV=production` in server environment
- [ ] Configure `MONGODB_URI` with production database
- [ ] Set strong `JWT_SECRET` (minimum 32 characters, not default)
- [ ] Configure `CORS_ORIGINS` with production domains
- [ ] Set `PORT` (default: 5000)
- [ ] Configure email settings (SMTP)
- [ ] Set `CLIENT_URL` for production frontend
- [ ] Configure any third-party API keys (Cloudinary, etc.)

### 2. Security
- [ ] Change default JWT_SECRET from 'fallback-secret'
- [ ] Ensure CORS_ORIGINS is properly configured
- [ ] Verify rate limiting is enabled
- [ ] Check that helmet security headers are active
- [ ] Verify authentication middleware is working
- [ ] Review file upload size limits
- [ ] Ensure sensitive data is not logged

### 3. Database
- [ ] Production MongoDB connection string configured
- [ ] Database indexes are created
- [ ] Database backup strategy in place
- [ ] Connection pooling configured

### 4. Error Handling
- [ ] All API routes have error handling
- [ ] Error logging is configured
- [ ] Error messages don't expose sensitive information in production
- [ ] Error boundaries are in place for React components
- [ ] Network error handling is implemented
- [ ] Timeout handling is configured

### 5. Logging
- [ ] Logging is configured for production
- [ ] Log rotation is set up
- [ ] Error logs are being captured
- [ ] Log levels are appropriate for production

### 6. Performance
- [ ] Compression is enabled
- [ ] Rate limiting is configured
- [ ] Database queries are optimized
- [ ] File upload limits are set
- [ ] Response caching where appropriate

### 7. Monitoring
- [ ] Health check endpoint is accessible (`/api/health`)
- [ ] Server monitoring is set up
- [ ] Error tracking is configured (optional)
- [ ] Uptime monitoring is configured

### 8. Client Applications
- [ ] API URL is configured for production
- [ ] Error boundaries are in place
- [ ] Network error handling is implemented
- [ ] Loading states are handled
- [ ] User-friendly error messages are shown

## Deployment Steps

### Server Deployment

1. **Prepare Environment**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with production values
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Start Server**
   ```bash
   # Using PM2 (recommended)
   pm2 start ecosystem.config.js --env production
   
   # Or using Node directly
   NODE_ENV=production node index.js
   ```

4. **Verify Deployment**
   - Check health endpoint: `https://yourdomain.com/api/health`
   - Verify database connection
   - Test authentication endpoints
   - Check error logs

### Client Application Deployment

1. **Configure API URL**
   - Set `EXPO_PUBLIC_API_URL` or `EXPO_PUBLIC_API_HOST` in environment
   - Update `app.config.js` with production API URL

2. **Build Application**
   ```bash
   # For Android
   eas build --platform android --profile production
   
   # For iOS
   eas build --platform ios --profile production
   ```

3. **Test Build**
   - Install on test device
   - Verify API connectivity
   - Test critical user flows
   - Check error handling

## Post-Deployment Verification

- [ ] Health check endpoint returns 200
- [ ] Database connection is active
- [ ] Authentication works correctly
- [ ] File uploads work
- [ ] Email sending works (if configured)
- [ ] Error handling displays user-friendly messages
- [ ] Logs are being generated correctly
- [ ] No sensitive information in logs
- [ ] CORS is working correctly
- [ ] Rate limiting is active

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MONGODB_URI is correct
   - Verify network access to MongoDB
   - Check firewall settings

2. **CORS Errors**
   - Verify CORS_ORIGINS includes your frontend domain
   - Check request headers

3. **Authentication Errors**
   - Verify JWT_SECRET is set correctly
   - Check token expiration settings

4. **File Upload Errors**
   - Check file size limits
   - Verify upload directory permissions
   - Check disk space

## Support

For issues or questions, check:
- Server logs: `server/logs/error.log`
- Server logs: `server/logs/combined.log`
- Health endpoint: `/api/health`


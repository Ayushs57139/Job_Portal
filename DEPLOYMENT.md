# Deployment Guide for JobWala

This guide will help you deploy the JobWala job portal application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [PM2 Deployment](#pm2-deployment)
6. [Production Checklist](#production-checklist)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas or self-hosted)
- Docker and Docker Compose (for Docker deployment)
- PM2 (for PM2 deployment)
- Domain name and SSL certificate (for production)
- Email service credentials (SMTP)
- Cloudinary account (for image uploads)

## Environment Setup

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cd server
cp env.example .env
```

### 2. Configure Environment Variables

Edit `server/.env` with your production values:

```env
NODE_ENV=production
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobwala?retryWrites=true&w=majority

# JWT Secret (use a strong, random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Your production domain
CLIENT_URL=https://yourdomain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Origins (comma-separated)
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 3. Update Mobile App Configuration

Update `app.config.js` in the root directory:

```javascript
extra: {
  apiHost: process.env.EXPO_PUBLIC_API_HOST || "api.yourdomain.com",
  apiPort: process.env.EXPO_PUBLIC_API_PORT || "443"
}
```

## Docker Deployment

### Quick Start

1. **Create `.env` file in root directory** (for docker-compose):

```bash
cp server/env.example .env
# Edit .env with your production values
```

2. **Build and start containers**:

```bash
docker-compose up -d
```

3. **View logs**:

```bash
docker-compose logs -f jobwala-server
```

4. **Stop containers**:

```bash
docker-compose down
```

### Docker Commands

```bash
# Build image
docker-compose build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Restart service
docker-compose restart jobwala-server

# Stop service
docker-compose stop

# Remove containers and volumes
docker-compose down -v
```

## Manual Deployment

### 1. Install Dependencies

```bash
cd server
npm install --production
```

### 2. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## PM2 Deployment (Recommended for VPS)

### 1. Install PM2 Globally

```bash
npm install -g pm2
```

### 2. Start with PM2

```bash
cd server
npm run prod
```

### 3. PM2 Management Commands

```bash
# View status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart
npm run pm2:restart

# Stop
npm run pm2:stop

# Delete
npm run pm2:delete
```

### 4. Setup PM2 to Start on Boot

```bash
pm2 startup
pm2 save
```

## Production Checklist

### Security

- [ ] Change `JWT_SECRET` to a strong, random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` with your production domains
- [ ] Use HTTPS/SSL certificates
- [ ] Enable firewall rules
- [ ] Use strong MongoDB credentials
- [ ] Enable MongoDB IP whitelist
- [ ] Review and update rate limiting settings
- [ ] Enable Helmet security headers (already configured)

### Database

- [ ] Use production MongoDB instance (MongoDB Atlas recommended)
- [ ] Enable MongoDB backups
- [ ] Configure MongoDB connection pooling
- [ ] Set up database monitoring

### Server Configuration

- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure domain DNS
- [ ] Set up monitoring and logging
- [ ] Configure automatic restarts (PM2/Docker)
- [ ] Set up health checks

### Email Configuration

- [ ] Configure SMTP settings
- [ ] Test email sending
- [ ] Set up email templates
- [ ] Configure email logging

### File Storage

- [ ] Configure Cloudinary account
- [ ] Set up upload directories with proper permissions
- [ ] Configure file size limits
- [ ] Set up backup for uploads

### Monitoring

- [ ] Set up application monitoring (e.g., PM2 Plus, New Relic)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

## Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/jobwala`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Connection "upgrade";
    }

    # Increase timeouts for file uploads
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/jobwala /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Server Won't Start

1. Check environment variables are set correctly
2. Verify MongoDB connection string
3. Check port 5000 is not in use: `lsof -i :5000`
4. Review server logs: `docker-compose logs` or `pm2 logs`

### Database Connection Issues

1. Verify MongoDB URI is correct
2. Check MongoDB IP whitelist
3. Verify MongoDB credentials
4. Check network connectivity

### CORS Errors

1. Verify `CORS_ORIGINS` includes your frontend domain
2. Check origin header in browser console
3. Ensure HTTPS is used in production

### File Upload Issues

1. Check upload directory permissions
2. Verify Cloudinary credentials
3. Check file size limits
4. Review multer configuration

### Email Not Sending

1. Verify SMTP credentials
2. Check email service status
3. Review email logs in server
4. Test with a simple email first

## Health Check

Test the server health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Support

For issues or questions:
1. Check server logs
2. Review error messages
3. Verify environment configuration
4. Test database connectivity
5. Check network and firewall settings

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Nginx Documentation](https://nginx.org/en/docs/)


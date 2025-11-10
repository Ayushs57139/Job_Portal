# JobWala - Quick Deployment Guide

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Copy environment file:**
   ```bash
   cp server/env.example .env
   ```

2. **Edit `.env` with your production values**

3. **Start the server:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Option 2: PM2 Deployment

1. **Copy environment file:**
   ```bash
   cp server/env.example server/.env
   ```

2. **Edit `server/.env` with your production values**

3. **Run deployment script:**
   ```bash
   # Linux/Mac
   ./deploy.sh
   
   # Windows
   .\deploy.ps1
   ```

   Or manually:
   ```bash
   cd server
   npm install --production
   npm run prod
   ```

## 📋 Required Environment Variables

Create `server/.env` with these variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
CLIENT_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGINS=https://yourdomain.com
```

## 🔧 Production Setup

1. **Configure Reverse Proxy (Nginx)**
   - See `DEPLOYMENT.md` for Nginx configuration

2. **Set up SSL Certificate**
   - Use Let's Encrypt or your SSL provider

3. **Update Mobile App API URL**
   - Update `app.config.js` with production API URL
   - Set `EXPO_PUBLIC_API_HOST` environment variable

4. **Configure Domain DNS**
   - Point your domain to server IP
   - Set up subdomain for API (e.g., api.yourdomain.com)

## 📚 Full Documentation

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## ✅ Health Check

Test your deployment:
```bash
curl http://localhost:5000/api/health
```

## 🆘 Troubleshooting

- **Server won't start:** Check `.env` file and MongoDB connection
- **CORS errors:** Verify `CORS_ORIGINS` includes your frontend domain
- **Database issues:** Check MongoDB URI and network connectivity
- **File uploads fail:** Verify Cloudinary credentials and directory permissions

For more help, see the Troubleshooting section in `DEPLOYMENT.md`


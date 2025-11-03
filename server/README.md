# JobWala Server

Backend server for JobWala Job Portal.

## Quick Start

### Production Deployment (with PM2 - Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
npm run pm2:start

# Or start in production mode
npm run prod

# View logs
npm run pm2:logs

# Check status
npm run pm2:status

# Restart server
npm run pm2:restart

# Stop server
npm run pm2:stop
```

### Without PM2

**Windows:**
```bash
.\start-server.ps1
```

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Development

```bash
npm run dev
```

### Standard Start

```bash
npm start
```

## Features

- ✅ Error handling and logging
- ✅ Auto-restart on crashes
- ✅ Database auto-reconnection
- ✅ Memory protection
- ✅ Health monitoring

## Health Check

```bash
curl http://localhost:5000/api/health
```

## Environment Variables

Create a `.env` file in the server directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
```

## Logs

PM2 logs are stored in:
- `server/logs/pm2-error.log`
- `server/logs/pm2-out.log`

## Support

For issues, check logs with `npm run pm2:logs`


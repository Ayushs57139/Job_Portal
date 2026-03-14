# MongoDB Connection Error Fix

## Error
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.vy1jecc.mongodb.net
```

## Root Causes & Solutions

### 1. IP Whitelist Not Configured (Most Common)
MongoDB Atlas blocks connections from IP addresses that aren't whitelisted.

**Solution:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster (Cluster0)
4. Click "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Choose one of:
   - **"Add Current IP Address"** - Adds your current IP
   - **"Allow Access from Anywhere"** - Enter `0.0.0.0/0` (for development only, not recommended for production)
7. Click "Confirm"
8. Wait 1-2 minutes for the changes to propagate

### 2. Firewall/Antivirus Blocking Connection
Your firewall or antivirus might be blocking outbound connections to MongoDB.

**Solution:**
- Temporarily disable firewall/antivirus to test
- If it works, add an exception for Node.js
- Allow outbound connections to `*.mongodb.net` on port 27017

### 3. DNS Resolution Issues
Your system might not be able to resolve MongoDB's DNS.

**Solution:**
Try using Google's DNS:
1. Open Network Settings
2. Change DNS to:
   - Primary: `8.8.8.8`
   - Secondary: `8.8.4.4`
3. Restart your network connection

### 4. VPN/Proxy Issues
If you're using a VPN or proxy, it might interfere with MongoDB connections.

**Solution:**
- Disconnect from VPN temporarily
- Try connecting again
- If it works, configure VPN to allow MongoDB connections

### 5. Incorrect Credentials
The username or password might be incorrect.

**Solution:**
1. Go to MongoDB Atlas
2. Click "Database Access" in the left sidebar
3. Verify the user `ayushs57139_db_user` exists
4. If needed, reset the password and update `.env` file

## Quick Test

Test the connection using MongoDB Compass or mongosh:

```bash
mongosh "mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin"
```

If this fails with the same error, the issue is with MongoDB Atlas configuration, not your code.

## Environment Variable Setup

The connection string is now stored in `server/.env`:

```env
MONGODB_URI=mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0
```

Make sure your server loads this file. Check `server/index.js` for:
```javascript
require('dotenv').config();
```

## Restart Server

After making changes:
```bash
cd server
npm start
```

## Still Not Working?

If none of the above works:

1. **Check MongoDB Atlas Status**: Visit [MongoDB Status Page](https://status.mongodb.com/)
2. **Try a different network**: Use mobile hotspot to rule out network issues
3. **Contact MongoDB Support**: The cluster might have issues

## Prevention

For production:
- Use environment variables (never hardcode credentials)
- Whitelist only specific IP addresses
- Use MongoDB Atlas private endpoints for better security
- Enable audit logs to track connection attempts

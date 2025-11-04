# Admin Panel Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd admin
npm install
```

### 2. Start the Admin Panel
```bash
# Windows
npm start
# or
.\start-admin.ps1

# Linux/Mac
npm start
# or
chmod +x start-admin.sh
./start-admin.sh
```

### 3. Access Admin Panel
- **Web**: Open `http://localhost:8081/admin` in your browser
- The admin panel will automatically show the login screen

## Configuration

### Backend API URL
The admin panel connects to the same backend as the main app. By default:
- **Local**: `http://localhost:5000/api`
- **Production**: Set `EXPO_PUBLIC_API_URL` environment variable

### Port Configuration
The admin panel runs on port **8081** by default. To change:
1. Edit `package.json` scripts
2. Change `--port 8081` to your desired port

## Project Structure

```
admin/
├── App.js                      # Main entry point
├── package.json                # Dependencies and scripts
├── app.json                    # Expo configuration
├── src/
│   ├── navigation/
│   │   └── AdminNavigator.js   # Admin-only routes
│   ├── screens/
│   │   ├── AdminLoginScreen.js  # Login screen
│   │   └── Admin/               # All admin screens
│   ├── components/
│   │   └── Admin/              # Admin components
│   ├── config/
│   │   └── api.js              # API config (same backend)
│   └── styles/
│       └── theme.js            # Theme configuration
```

## Features

✅ **Complete Admin Functionality**
- User Management
- Job Management
- Application Management
- Analytics & Dashboard
- Settings & Configuration
- Master Data Management
- Email Templates & Logs
- And more...

✅ **Separate from Main App**
- Independent project
- Different URL/port
- Can be deployed separately
- Doesn't affect main app

✅ **Same Backend**
- Uses existing backend API
- No backend changes needed
- All admin routes available

## Development

### Running Both Projects Simultaneously

1. **Main App** (port 8080 or default):
   ```bash
   cd ..  # Go to main project
   npm start
   ```

2. **Admin Panel** (port 8081):
   ```bash
   cd admin
   npm start
   ```

Both projects can run at the same time and connect to the same backend.

## Troubleshooting

### Port Already in Use
If port 8081 is in use, change it in `package.json`:
```json
"start": "expo start --port 8082"
```

### Cannot Connect to Backend
1. Ensure backend server is running on port 5000
2. Check `src/config/api.js` for correct API URL
3. Set `EXPO_PUBLIC_API_URL` environment variable if needed

### Import Errors
All admin screens should use relative imports. If you see import errors:
- Check that all files were copied correctly
- Verify import paths are relative to the file location
- Ensure `src/config/api.js` and `src/styles/theme.js` exist

## Notes

- The admin panel is completely separate from the main application
- Admin routes are only available in this project
- The main app remains unchanged
- Both projects share the same backend API
- You can modify admin panel without affecting main app


# Free Job Wala Admin Panel

This is a separate admin project that runs independently from the main application. It connects to the same backend server but provides a dedicated admin interface on a separate URL/port.

## Project Structure

```
admin/
├── App.js                    # Main app entry point
├── package.json              # Admin project dependencies
├── app.json                  # Expo configuration for admin
├── babel.config.js           # Babel configuration
├── assets/                   # App assets (icons, splash screens)
└── src/
    ├── navigation/
    │   └── AdminNavigator.js  # Admin-only navigation
    ├── screens/
    │   ├── AdminLoginScreen.js  # Admin login
    │   └── Admin/              # All admin management screens
    ├── components/
    │   └── Admin/             # Admin-specific components
    ├── config/
    │   └── api.js             # API configuration (shared backend)
    └── styles/
        └── theme.js           # Theme configuration
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Start the Admin Server**
   ```bash
   npm start
   ```
   The admin panel will run on port **8081** by default.

3. **Access the Admin Panel**
   - Web: `http://localhost:8081/admin`
   - The admin panel will automatically redirect to login if not authenticated

## Features

- **Separate URL**: Admin panel runs on port 8081 (configurable)
- **Dedicated Routes**: Only admin-related screens and functionality
- **Same Backend**: Connects to the same backend API as the main app
- **Admin Authentication**: Secure admin login with role verification
- **Complete Admin Features**: All admin management screens included

## Admin Routes

The admin panel includes all admin management features:
- Dashboard & Analytics
- User Management
- Job Management
- Application Management
- Role & Permission Management
- Team Limits
- Email Templates & Logs
- SMTP Settings
- Package Management
- Master Data Management
- And more...

## Backend Connection

The admin panel connects to the same backend server (default: `http://localhost:5000/api`). All admin API endpoints are available at `/api/admin/*`.

## Configuration

### Change Admin Port

Edit `package.json`:
```json
{
  "scripts": {
    "start": "expo start --port 8081"
  }
}
```

### Change Backend URL

Edit `src/config/api.js` or set environment variable:
```bash
EXPO_PUBLIC_API_URL=http://your-backend-url:5000/api
```

## Development

The admin project is completely separate from the main project. You can:
- Modify admin screens without affecting the main app
- Run both projects simultaneously
- Deploy admin panel independently
- Use different styling/theming for admin

## Notes

- The admin panel does NOT include public site features (job listings, company profiles, etc.)
- All admin routes require authentication
- Only users with `admin` or `superadmin` userType can access
- The backend server remains unchanged and shared between both projects


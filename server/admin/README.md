# Admin Routes Structure

This folder contains all admin-related routes organized by functionality for easier management and setup.

## Structure

```
admin/
├── index.js              # Main router that combines all admin routes
├── dashboard.js          # Dashboard and analytics routes ✅ COMPLETE
├── users.js             # User management routes ✅ COMPLETE
├── jobs.js              # Job management routes ✅ COMPLETE
├── applications.js      # Application management routes ✅ COMPLETE
├── packages.js          # Package management routes ⏳ TODO
├── email-templates.js   # Email template management routes ⏳ TODO
├── email-logs.js        # Email log management routes ⏳ TODO
├── master-data.js       # Master data management routes ⏳ TODO
├── roles.js             # Role and permission management routes ⏳ TODO
├── team-limits.js       # Team limit management routes ⏳ TODO
├── settings.js          # Platform settings routes ⏳ TODO
└── comments.js          # Comment settings routes ⏳ TODO
```

## Route Prefixes

All routes in this folder are automatically prefixed with `/api/admin` when used in the main server.

For example:
- `router.get('/dashboard', ...)` becomes `/api/admin/dashboard`
- `router.get('/users', ...)` becomes `/api/admin/users`
- `router.get('/jobs/:id', ...)` becomes `/api/admin/jobs/:id`

## Authentication

All routes (except test routes and master data routes) are protected by admin authentication middleware defined in `admin/index.js`.

## Migration Status

### ✅ Completed
- **Dashboard** (`dashboard.js`): Dashboard statistics, analytics, and create admin routes
- **Users** (`users.js`): Complete user management (CRUD, verification, bulk import, team limits)
- **Jobs** (`jobs.js`): Complete job management (CRUD, status updates)
- **Applications** (`applications.js`): Complete application management (CRUD, status updates)

### ⏳ Pending Migration
The following files are placeholders and need routes migrated from `routes/admin.js`:

1. **packages.js** (lines 1664-1907): Package management routes
2. **email-templates.js** (lines 2088-2363): Email template management
3. **email-logs.js** (lines 2359-2615): Email log management
4. **master-data.js** (lines 2617-3723): Master data (industries, departments, skills, etc.)
5. **roles.js** (lines 577-859): Role and permission management
6. **team-limits.js** (lines 1364-1521): Team limit management
7. **settings.js**: Platform settings (migrate from `routes/settings.js`)
8. **comments.js** (lines 1930-2043): Comment settings

## How to Migrate Routes

1. Open the original `routes/admin.js` file
2. Find the section indicated by the line numbers in the TODO comment
3. Copy the route handlers to the corresponding file in this folder
4. Update imports and ensure all dependencies are included
5. Test the routes to ensure they work correctly
6. Remove the migrated routes from `routes/admin.js` once verified

## Notes

- The original `routes/admin.js` file is kept as a reference during migration
- Once all routes are migrated, the old `routes/admin.js` can be archived or removed
- All routes maintain the same API endpoints, so frontend changes are not required


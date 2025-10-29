# Backend-Frontend Integration Guide

## Overview
This document provides a comprehensive guide for the complete integration between the JobWala backend (Node.js/Express/MongoDB) and frontend (React Native/Expo).

## System Architecture

### Backend
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Port**: 5000
- **Base URL**: `http://localhost:5000/api`

### Frontend
- **Framework**: React Native with Expo
- **State Management**: React Hooks
- **Navigation**: React Navigation
- **Storage**: AsyncStorage

## Authentication System

### User Types
The system supports 4 distinct user types:

1. **Job Seeker** (`userType: 'jobseeker'`)
   - Browse and search jobs
   - Apply for positions
   - Save jobs
   - Manage applications
   - Build resume

2. **Company** (`userType: 'employer', employerType: 'company'`)
   - Post jobs
   - Manage job listings
   - Review applications
   - Company profile management

3. **Consultancy** (`userType: 'employer', employerType: 'consultancy'`)
   - Similar to Company but for consultancy firms
   - Post jobs on behalf of clients
   - Candidate management
   - Client relationship tracking

4. **Admin/Super Admin** (`userType: 'admin'` or `userType: 'superadmin'`)
   - User management
   - Job approval/rejection
   - System analytics
   - Platform configuration

### Login Flow

#### Endpoint: `POST /api/auth/login`

**Request Body:**
```json
{
  "loginId": "JW12345678 | email@example.com | phone",
  "password": "userPassword",
  "userType": "jobseeker|employer|admin|superadmin",
  "employerType": "company|consultancy" // Only for employers
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "userId": "JW12345678",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "userType": "jobseeker",
    "employerType": null,
    "phone": "+1234567890",
    "profile": {...}
  }
}
```

### Registration Flow

#### Endpoint: `POST /api/auth/register`

**Job Seeker Registration:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "userType": "jobseeker"
}
```

**Company Registration:**
```json
{
  "firstName": "Company",
  "lastName": "Admin",
  "email": "admin@company.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "userType": "employer",
  "employerType": "company",
  "company": {
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "employeeCount": 100,
    "location": "New York, NY"
  }
}
```

## Dashboard Routes

### User Dashboard (Job Seeker)
**Route**: `UserDashboard`
**Features**:
- Application statistics
- Saved jobs count
- Profile views
- Quick actions (Browse Jobs, Applications, Profile, etc.)

**API Calls**:
- `GET /api/applications/my-applications` - Get user applications
- `GET /api/saved-jobs` - Get saved jobs

### Company Dashboard
**Route**: `CompanyDashboard`
**Features**:
- Active jobs count
- Total applications
- Shortlisted candidates
- Pending reviews

**API Calls**:
- `GET /api/employers/stats` - Get employer statistics
- `GET /api/employers/jobs` - Get posted jobs
- `GET /api/employers/jobs/:jobId/applications` - Get job applications

### Consultancy Dashboard
**Route**: `ConsultancyDashboard`
**Features**:
- Similar to Company Dashboard
- Additional client management features
- Clients served count

**API Calls**:
- `GET /api/employers/stats` - Get employer statistics
- `GET /api/employers/jobs` - Get posted jobs

### Admin Dashboard
**Route**: `AdminDashboard`
**Features**:
- Total users count
- Total jobs
- Total applications
- Active companies/consultancies
- Pending job approvals

**API Calls**:
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs` - Get all jobs

## API Configuration

### Environment Setup

The frontend automatically detects the environment and adjusts the API URL:

**Web Development**: `http://localhost:5000/api`
**Android Emulator**: `http://10.0.2.2:5000/api`
**iOS Simulator**: `http://localhost:5000/api`

For production or custom server, update the API URL in `src/config/api.js`:

```javascript
api.setApiUrl('https://your-production-server.com/api');
```

## Core API Methods

### Authentication
```javascript
// Login
await api.login({
  loginId: 'user@example.com',
  password: 'password',
  userType: 'jobseeker'
});

// Register
await api.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'password',
  userType: 'jobseeker'
});

// Logout
await api.logout();

// Get current user
const user = await api.getCurrentUser();
```

### Jobs
```javascript
// Get all jobs
const jobs = await api.getJobs({ location: 'New York', jobType: 'full-time' });

// Get single job
const job = await api.getJob(jobId);

// Post job (Employer only)
await api.createJob({
  title: 'Software Engineer',
  description: 'Job description...',
  location: { city: 'New York', state: 'NY' },
  salary: { min: 80000, max: 120000 }
});

// Update job
await api.updateJob(jobId, updateData);

// Delete job
await api.deleteJob(jobId);
```

### Applications
```javascript
// Apply for job
await api.applyForJob(jobId, {
  coverLetter: 'I am interested...'
});

// Get my applications
const applications = await api.getMyApplications();

// Get applications for a job (Employer)
const jobApplications = await api.getJobApplications(jobId);

// Update application status (Employer)
await api.updateApplicationStatus(applicationId, 'shortlisted');
```

### Saved Jobs
```javascript
// Get saved jobs
const savedJobs = await api.getSavedJobs();

// Save a job
await api.saveJob(jobId);

// Unsave a job
await api.unsaveJob(jobId);
```

## Running the Application

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

4. Start the server:
```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

For specific platforms:
```bash
npm run web      # Web browser
npm run android  # Android emulator
npm run ios      # iOS simulator
```

## Testing User Flows

### Test Admin Login
1. Navigate to Login screen
2. Select "Admin" user type
3. Enter admin credentials:
   - Login ID: admin email or user ID
   - Password: admin password
4. Should redirect to Admin Dashboard

### Test Company Login
1. Navigate to Login screen
2. Select "Employer" user type
3. Select "Company" employer type
4. Enter company credentials
5. Should redirect to Company Dashboard

### Test Consultancy Login
1. Navigate to Login screen
2. Select "Employer" user type
3. Select "Consultancy" employer type
4. Enter consultancy credentials
5. Should redirect to Consultancy Dashboard

### Test Job Seeker Login
1. Navigate to Login screen
2. Select "Job Seeker" user type
3. Enter job seeker credentials
4. Should redirect to User Dashboard

## Common Issues and Solutions

### Issue 1: Cannot connect to backend
**Solution**: 
- Ensure backend server is running on port 5000
- For Android emulator, use `http://10.0.2.2:5000/api`
- Check firewall settings

### Issue 2: Login fails with valid credentials
**Solution**:
- Verify userType and employerType match the account
- Check network connectivity
- Verify JWT_SECRET is set in backend .env

### Issue 3: Dashboard shows no data
**Solution**:
- Check if API calls are successful in console
- Verify token is stored in AsyncStorage
- Ensure backend routes are properly configured

## Security Considerations

1. **Token Storage**: JWT tokens are stored in AsyncStorage
2. **Token Expiry**: Tokens expire after 7 days (configurable)
3. **Password Security**: Passwords are hashed using bcrypt
4. **API Authentication**: Protected routes require Bearer token
5. **Input Validation**: All inputs are validated on backend

## Future Enhancements

- [ ] Real-time notifications using Socket.io
- [ ] Advanced search with filters
- [ ] Resume parsing and AI matching
- [ ] Video interview scheduling
- [ ] Analytics dashboard for employers
- [ ] Payment integration for premium packages

## Support

For issues or questions:
1. Check this documentation
2. Review the API documentation in backend
3. Check console logs for errors
4. Verify all environment variables are set

## Version Information

- **Frontend**: React Native (Expo)
- **Backend**: Node.js v14+
- **Database**: MongoDB v4.4+
- **Last Updated**: October 2025


# Admin Candidate Management API Documentation

This document outlines the backend API endpoints required for the Admin Candidate Management features including Login as User, Edit Candidate Details, Upload Resume, and Profile Photo management.

## Table of Contents
1. [Authentication](#authentication)
2. [Candidate Management Endpoints](#candidate-management-endpoints)
3. [File Upload Endpoints](#file-upload-endpoints)
4. [Login as User](#login-as-user)
5. [Database Schema Updates](#database-schema-updates)

---

## Authentication

All admin endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer <admin_token>
```

---

## Candidate Management Endpoints

### 1. Get Candidate Profile
**Endpoint:** `GET /api/user-profiles/:candidateId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "_id": "candidate_id",
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "whatsappNumber": "+1234567890",
      "gender": "Male",
      "dateOfBirth": "1990-01-01",
      "currentCity": "New York",
      "pincode": "10001",
      "category": "General",
      "maritalStatus": "Single"
    },
    "professional": {
      "currentJobTitle": "Software Engineer",
      "currentCompany": "Tech Corp",
      "experienceLevel": "Experienced",
      "totalExperience": 5,
      "currentSalary": 100000,
      "industry": "Information Technology",
      "department": "Engineering",
      "keySkills": ["JavaScript", "React", "Node.js"],
      "preferredLanguage": ["English", "Hindi"],
      "englishFluencyLevel": "Fluent",
      "companyType": "Corporate"
    },
    "education": [
      {
        "degree": "B.Tech",
        "institution": "MIT",
        "specialization": "Computer Science",
        "educationStatus": "Completed",
        "educationType": "Full Time",
        "startDate": "2008",
        "endDate": "2012",
        "marksType": "Percentage",
        "marksValue": "85"
      }
    ],
    "preferences": {
      "jobTypePreference": "Full Time",
      "employmentType": "Permanent",
      "workMode": "Hybrid",
      "expectedSalary": 120000,
      "noticePeriod": "30 Days",
      "willingToRelocate": true,
      "preferredLocations": ["New York", "San Francisco"]
    },
    "labels": ["premium", "actively_searching"],
    "profileImage": "https://example.com/images/profile.jpg",
    "resumeUrl": "https://example.com/resumes/resume.pdf",
    "profileStatus": {
      "hasResume": true,
      "emailVerified": true,
      "mobileVerified": true,
      "whatsappAvailable": true,
      "completionPercentage": 95
    }
  }
}
```

---

### 2. Update Candidate Profile (Admin)
**Endpoint:** `PUT /api/admin/candidates/:candidateId`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "personalInfo": {
    "fullName": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567890",
    "whatsappNumber": "+1234567890",
    "gender": "Male",
    "dateOfBirth": "1990-01-01",
    "currentCity": "New York",
    "pincode": "10001",
    "category": "General",
    "maritalStatus": "Single"
  },
  "professional": {
    "currentJobTitle": "Senior Software Engineer",
    "currentCompany": "Tech Corp",
    "experienceLevel": "Experienced",
    "totalExperience": 6,
    "currentSalary": 120000,
    "industry": "Information Technology",
    "department": "Engineering",
    "keySkills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "preferredLanguage": ["English", "Hindi"],
    "englishFluencyLevel": "Fluent",
    "companyType": "Corporate"
  },
  "education": [
    {
      "degree": "B.Tech",
      "institution": "MIT",
      "specialization": "Computer Science",
      "educationStatus": "Completed",
      "educationType": "Full Time",
      "startDate": "2008",
      "endDate": "2012",
      "marksType": "Percentage",
      "marksValue": "85"
    }
  ],
  "preferences": {
    "jobTypePreference": "Full Time",
    "employmentType": "Permanent",
    "workMode": "Hybrid",
    "expectedSalary": 150000,
    "noticePeriod": "30 Days",
    "willingToRelocate": true,
    "preferredLocations": ["New York", "San Francisco", "Boston"]
  },
  "labels": ["premium", "actively_searching", "featured"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate profile updated successfully",
  "profile": {
    // Updated profile object
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to update candidate profile",
  "error": "Error details"
}
```

---

## File Upload Endpoints

### 3. Upload Profile Image
**Endpoint:** `POST /api/admin/candidates/:candidateId/profile-image`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
profileImage: <image_file> (JPEG, PNG, max 5MB)
```

**Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://example.com/uploads/profiles/candidate_id_timestamp.jpg"
}
```

**Implementation Notes:**
- Accept image formats: JPEG, PNG, GIF
- Maximum file size: 5MB
- Resize image to 500x500px
- Store in cloud storage (AWS S3, Cloudinary, etc.)
- Update user profile with new image URL
- Delete old image if exists

---

### 4. Upload Resume
**Endpoint:** `POST /api/admin/candidates/:candidateId/resume`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
resume: <document_file> (PDF, DOC, DOCX, max 10MB)
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://example.com/uploads/resumes/candidate_id_timestamp.pdf",
  "fileName": "resume.pdf",
  "fileSize": 1024000
}
```

**Implementation Notes:**
- Accept document formats: PDF, DOC, DOCX
- Maximum file size: 10MB
- Store in cloud storage
- Update user profile with resume URL
- Parse resume content for auto-fill (optional)
- Delete old resume if exists

---

## Login as User

### 5. Admin Login as User
**Endpoint:** `POST /api/admin/login-as-user/:userId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged in as user successfully",
  "token": "user_jwt_token",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": true
  }
}
```

**Implementation Notes:**
- Verify admin has permission to login as user
- Generate new JWT token for the user
- Log the admin action for audit trail
- Include admin_id in token payload for tracking
- Set token expiration (e.g., 24 hours)
- Store login activity in database

**Security Considerations:**
- Log all "login as user" actions with:
  - Admin ID
  - User ID
  - Timestamp
  - IP Address
  - Action performed
- Implement rate limiting
- Require additional authentication for sensitive operations
- Notify user via email when admin logs in as them (optional)

---

## Candidate Labels Endpoints

### 6. Get Candidate Labels
**Endpoint:** `GET /api/candidates/:candidateId/labels`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "labels": ["premium", "actively_searching", "featured"]
}
```

---

### 7. Update Candidate Labels
**Endpoint:** `PUT /api/candidates/:candidateId/labels`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "labels": ["premium", "starred", "profile_booster"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Labels updated successfully",
  "labels": ["premium", "starred", "profile_booster"]
}
```

**Valid Label Values:**
- `premium` - Premium Candidate
- `starred` - Starred Candidate
- `featured` - Featured Candidate
- `actively_searching` - Actively Job Searching
- `urgent` - Urgent Candidate
- `profile_booster` - Profile Booster

---

### 8. Get Candidates by Label
**Endpoint:** `GET /api/candidates/by-label/:label`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
```
page: 1
limit: 20
sortBy: updatedAt
sortOrder: desc
```

**Response:**
```json
{
  "success": true,
  "candidates": [
    {
      "_id": "candidate_id",
      "name": "John Doe",
      "email": "john@example.com",
      "currentJobTitle": "Software Engineer",
      "labels": ["premium", "actively_searching"]
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

---

## Database Schema Updates

### User/Candidate Model Updates

Add the following fields to your User/Candidate schema:

```javascript
// MongoDB Schema Example
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Profile Image
  profileImage: {
    type: String,
    default: null
  },
  
  // Resume
  resumeUrl: {
    type: String,
    default: null
  },
  resumeFileName: {
    type: String,
    default: null
  },
  resumeFileSize: {
    type: Number,
    default: null
  },
  resumeUploadedAt: {
    type: Date,
    default: null
  },
  
  // Candidate Labels
  labels: {
    type: [String],
    enum: ['premium', 'starred', 'featured', 'actively_searching', 'urgent', 'profile_booster'],
    default: []
  },
  
  // ... existing fields ...
});
```

### Admin Activity Log Schema

Create a new collection to track admin actions:

```javascript
const adminActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login_as_user', 'update_candidate', 'upload_resume', 'upload_profile_image', 'update_labels']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
```

---

## Middleware Requirements

### 1. Admin Authentication Middleware
```javascript
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    req.admin = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```

### 2. File Upload Middleware
```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.fieldname === 'profileImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
  // Accept documents only
  else if (file.fieldname === 'resume') {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (only in development)"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Testing Checklist

- [ ] Admin can view candidate details
- [ ] Admin can edit all candidate fields
- [ ] Admin can upload profile image (JPEG, PNG)
- [ ] Admin can upload resume (PDF, DOC, DOCX)
- [ ] Admin can manage candidate labels
- [ ] Admin can login as user
- [ ] User token is generated correctly
- [ ] Admin actions are logged
- [ ] File size limits are enforced
- [ ] File type validation works
- [ ] Old files are deleted when new ones are uploaded
- [ ] Unauthorized access is prevented
- [ ] Error handling works correctly

---

## Security Best Practices

1. **Authentication & Authorization**
   - Verify admin role for all endpoints
   - Use JWT tokens with expiration
   - Implement rate limiting

2. **File Upload Security**
   - Validate file types and sizes
   - Scan files for malware
   - Store files in secure location
   - Use signed URLs for access

3. **Data Validation**
   - Validate all input data
   - Sanitize user inputs
   - Use schema validation

4. **Audit Trail**
   - Log all admin actions
   - Store IP addresses
   - Track changes to sensitive data

5. **Privacy**
   - Notify users when admin accesses their account
   - Implement data access controls
   - Follow GDPR/privacy regulations

---

## Implementation Priority

1. **Phase 1 (High Priority)**
   - Get candidate profile endpoint
   - Update candidate profile endpoint
   - Admin authentication middleware

2. **Phase 2 (Medium Priority)**
   - Upload profile image endpoint
   - Upload resume endpoint
   - File upload middleware

3. **Phase 3 (Medium Priority)**
   - Login as user endpoint
   - Admin activity logging

4. **Phase 4 (Low Priority)**
   - Candidate labels endpoints
   - Get candidates by label endpoint

---

## Support

For questions or issues, please contact the development team.

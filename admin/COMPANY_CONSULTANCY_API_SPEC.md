# Company & Consultancy Management API Specification

## Overview
This document specifies the backend API endpoints required for the Company and Consultancy Management features in the admin panel.

## Base URL
```
/api/admin
```

## Authentication
All endpoints require admin authentication via Bearer token:
```
Authorization: Bearer <admin_token>
```

---

## Companies Endpoints

### 1. List All Companies
**GET** `/admin/companies`

**Description**: Retrieve a list of all registered companies with statistics.

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 50)
- `search` (optional): Search query for company name, email, or contact person
- `status` (optional): Filter by status (active, inactive, pending, blocked)
- `verified` (optional): Filter by verification status (true, false)

**Response**:
```json
{
  "success": true,
  "companies": [
    {
      "_id": "company_id",
      "companyName": "Tech Corp",
      "email": "contact@techcorp.com",
      "phone": "+1234567890",
      "contactPerson": "John Doe",
      "address": "123 Tech Street",
      "city": "San Francisco",
      "state": "California",
      "country": "USA",
      "pincode": "94102",
      "website": "https://techcorp.com",
      "industry": "Technology",
      "sectors": ["IT", "Software"],
      "departments": ["Engineering", "Sales"],
      "designation": "CEO",
      "description": "Leading tech company",
      "foundedYear": "2010",
      "companySize": "100-500",
      "profilePhoto": "/uploads/companies/profile_123.jpg",
      "coverPhoto": "/uploads/companies/cover_123.jpg",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "lastActive": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 2,
    "limit": 50
  },
  "stats": {
    "total": 100,
    "active": 80,
    "pending": 15,
    "blocked": 5,
    "verified": 85,
    "unverified": 15
  }
}
```

---

### 2. Get Company Details
**GET** `/admin/companies/:id`

**Description**: Retrieve detailed information about a specific company including their posted jobs.

**URL Parameters**:
- `id`: Company ID

**Response**:
```json
{
  "success": true,
  "company": {
    "_id": "company_id",
    "companyName": "Tech Corp",
    "email": "contact@techcorp.com",
    "phone": "+1234567890",
    "contactPerson": "John Doe",
    "address": "123 Tech Street",
    "city": "San Francisco",
    "state": "California",
    "country": "USA",
    "pincode": "94102",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "sectors": ["IT", "Software"],
    "departments": ["Engineering", "Sales"],
    "designation": "CEO",
    "description": "Leading tech company",
    "foundedYear": "2010",
    "companySize": "100-500",
    "profilePhoto": "/uploads/companies/profile_123.jpg",
    "coverPhoto": "/uploads/companies/cover_123.jpg",
    "isActive": true,
    "isVerified": true,
    "verifiedAt": "2024-01-10T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "lastActive": "2024-01-20T00:00:00.000Z",
    "jobsPosted": 25,
    "activeJobs": 15,
    "totalApplications": 500
  },
  "jobs": [
    {
      "_id": "job_id",
      "title": "Senior Developer",
      "location": "San Francisco, CA",
      "status": "active",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "applicationsCount": 50
    }
  ]
}
```

---

### 3. Update Company
**PUT** `/admin/companies/:id`

**Description**: Update company information.

**URL Parameters**:
- `id`: Company ID

**Request Body**:
```json
{
  "companyName": "Tech Corp Updated",
  "email": "newemail@techcorp.com",
  "phone": "+1234567890",
  "contactPerson": "Jane Doe",
  "address": "456 New Street",
  "city": "San Francisco",
  "state": "California",
  "country": "USA",
  "pincode": "94103",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "sectors": ["IT", "Software", "AI"],
  "departments": ["Engineering", "Sales", "Marketing"],
  "designation": "CEO",
  "description": "Updated description",
  "foundedYear": "2010",
  "companySize": "500-1000"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Company updated successfully",
  "company": {
    // Updated company object
  }
}
```

---

### 4. Delete Company
**DELETE** `/admin/companies/:id`

**Description**: Permanently delete a company and all associated data.

**URL Parameters**:
- `id`: Company ID

**Response**:
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

---

### 5. Toggle Company Status
**PATCH** `/admin/companies/:id/status`

**Description**: Activate or deactivate a company.

**URL Parameters**:
- `id`: Company ID

**Request Body**:
```json
{
  "isActive": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Company status updated successfully",
  "company": {
    "_id": "company_id",
    "isActive": false
  }
}
```

---

### 6. Verify Company
**PATCH** `/admin/companies/:id/verify`

**Description**: Verify a company account.

**URL Parameters**:
- `id`: Company ID

**Response**:
```json
{
  "success": true,
  "message": "Company verified successfully",
  "company": {
    "_id": "company_id",
    "isVerified": true,
    "verifiedAt": "2024-01-20T00:00:00.000Z"
  }
}
```

---

### 7. Duplicate Company
**POST** `/admin/companies/:id/duplicate`

**Description**: Create a duplicate copy of a company.

**URL Parameters**:
- `id`: Company ID

**Response**:
```json
{
  "success": true,
  "message": "Company duplicated successfully",
  "company": {
    "_id": "new_company_id",
    "companyName": "Tech Corp (Copy)",
    // ... other fields copied
  }
}
```

---

### 8. Suspend Company
**POST** `/admin/companies/:id/suspend`

**Description**: Suspend a company account temporarily.

**URL Parameters**:
- `id`: Company ID

**Request Body** (optional):
```json
{
  "reason": "Violation of terms",
  "duration": 30
}
```

**Response**:
```json
{
  "success": true,
  "message": "Company suspended successfully",
  "company": {
    "_id": "company_id",
    "isSuspended": true,
    "suspendedAt": "2024-01-20T00:00:00.000Z",
    "suspensionReason": "Violation of terms",
    "suspensionDuration": 30
  }
}
```

---

### 9. Upload Profile Photo
**POST** `/admin/companies/:id/upload-profile`

**Description**: Upload company profile photo/logo.

**URL Parameters**:
- `id`: Company ID

**Request**: Multipart form data
- `image`: Image file (JPEG, PNG)

**Response**:
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "imageUrl": "/uploads/companies/profile_123.jpg"
}
```

---

### 10. Upload Cover Photo
**POST** `/admin/companies/:id/upload-cover`

**Description**: Upload company cover photo.

**URL Parameters**:
- `id`: Company ID

**Request**: Multipart form data
- `image`: Image file (JPEG, PNG)

**Response**:
```json
{
  "success": true,
  "message": "Cover photo uploaded successfully",
  "imageUrl": "/uploads/companies/cover_123.jpg"
}
```

---

### 11. Send Email to Company
**POST** `/admin/companies/:id/send-email`

**Description**: Send various types of emails to company.

**URL Parameters**:
- `id`: Company ID

**Request Body**:
```json
{
  "emailType": "activation",
  "customSubject": "Welcome to our platform",
  "customMessage": "Custom email content"
}
```

**Email Types**:
- `activation`: Send activation link
- `password-reset`: Send password reset link
- `custom`: Send custom email

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

### 12. Bulk Approve Companies
**POST** `/admin/companies/bulk/approve`

**Description**: Approve multiple companies at once.

**Request Body**:
```json
{
  "companyIds": ["company_id_1", "company_id_2", "company_id_3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Companies approved successfully",
  "approved": 3,
  "failed": 0
}
```

---

### 13. Bulk Block Companies
**POST** `/admin/companies/bulk/block`

**Description**: Block multiple companies at once.

**Request Body**:
```json
{
  "companyIds": ["company_id_1", "company_id_2"],
  "reason": "Spam activity detected"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Companies blocked successfully",
  "blocked": 2,
  "failed": 0
}
```

---

### 14. Bulk Delete Companies
**POST** `/admin/companies/bulk/delete`

**Description**: Delete multiple companies at once.

**Request Body**:
```json
{
  "companyIds": ["company_id_1", "company_id_2"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Companies deleted successfully",
  "deleted": 2,
  "failed": 0
}
```

---

## Consultancies Endpoints

All consultancy endpoints follow the same structure as company endpoints, but use `/admin/consultancies` as the base path.

### Endpoint List:
1. **GET** `/admin/consultancies` - List all consultancies
2. **GET** `/admin/consultancies/:id` - Get consultancy details
3. **PUT** `/admin/consultancies/:id` - Update consultancy
4. **DELETE** `/admin/consultancies/:id` - Delete consultancy
5. **PATCH** `/admin/consultancies/:id/status` - Toggle status
6. **PATCH** `/admin/consultancies/:id/verify` - Verify consultancy
7. **POST** `/admin/consultancies/:id/duplicate` - Duplicate consultancy
8. **POST** `/admin/consultancies/:id/suspend` - Suspend consultancy
9. **POST** `/admin/consultancies/:id/upload-profile` - Upload profile photo
10. **POST** `/admin/consultancies/:id/upload-cover` - Upload cover photo
11. **POST** `/admin/consultancies/:id/send-email` - Send email
12. **POST** `/admin/consultancies/bulk/approve` - Bulk approve
13. **POST** `/admin/consultancies/bulk/block` - Bulk block
14. **POST** `/admin/consultancies/bulk/delete` - Bulk delete

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Company not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Database Schema

### Company/Consultancy Model
```javascript
{
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  contactPerson: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },
  website: { type: String },
  industry: { type: String },
  sectors: [{ type: String }],
  departments: [{ type: String }],
  designation: { type: String },
  description: { type: String },
  foundedYear: { type: String },
  companySize: { type: String },
  profilePhoto: { type: String },
  coverPhoto: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  isSuspended: { type: Boolean, default: false },
  suspendedAt: { type: Date },
  suspensionReason: { type: String },
  suspensionDuration: { type: Number },
  lastActive: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## Implementation Notes

### Security
1. Validate all input data
2. Sanitize file uploads
3. Check admin permissions for all operations
4. Log all admin actions for audit trail
5. Rate limit bulk operations

### Performance
1. Index frequently queried fields (email, isActive, isVerified)
2. Implement pagination for list endpoints
3. Cache statistics data
4. Optimize image uploads with compression
5. Use database transactions for bulk operations

### File Upload
1. Validate file types (JPEG, PNG only)
2. Limit file size (max 5MB for profile, 10MB for cover)
3. Generate unique filenames
4. Store in organized directory structure
5. Create thumbnails for optimization

### Email Service
1. Use queue system for bulk emails
2. Implement email templates
3. Track email delivery status
4. Handle bounces and failures
5. Respect email rate limits

### Validation Rules
- **companyName**: Required, 2-200 characters
- **email**: Required, valid email format, unique
- **phone**: Optional, valid phone format
- **website**: Optional, valid URL format
- **pincode**: Optional, alphanumeric
- **foundedYear**: Optional, 4-digit year
- **companySize**: Optional, predefined ranges

---

## Testing Checklist

### Unit Tests
- [ ] Company CRUD operations
- [ ] Consultancy CRUD operations
- [ ] Bulk operations
- [ ] File uploads
- [ ] Email sending
- [ ] Status toggles
- [ ] Verification process

### Integration Tests
- [ ] End-to-end company management flow
- [ ] End-to-end consultancy management flow
- [ ] Bulk operations with multiple records
- [ ] File upload and retrieval
- [ ] Email delivery

### Security Tests
- [ ] Authentication required for all endpoints
- [ ] Admin role verification
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload security

---

## Deployment Considerations

1. **Environment Variables**:
   - `UPLOAD_DIR`: Directory for file uploads
   - `MAX_FILE_SIZE`: Maximum file size limit
   - `EMAIL_SERVICE`: Email service configuration
   - `ADMIN_EMAIL`: Admin notification email

2. **Database Migrations**:
   - Create companies collection/table
   - Create consultancies collection/table
   - Add indexes
   - Seed initial data if needed

3. **File Storage**:
   - Configure local or cloud storage
   - Set up CDN for image delivery
   - Implement backup strategy

4. **Monitoring**:
   - Log all admin actions
   - Monitor API performance
   - Track error rates
   - Set up alerts for failures

---

## Version History

### v1.0.0
- Initial API specification
- All CRUD endpoints
- Bulk operations
- File uploads
- Email functionality

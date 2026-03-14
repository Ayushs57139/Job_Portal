# Backend Implementation Guide - Company & Consultancy Management

## 🎯 Overview

This guide provides step-by-step instructions for backend developers to implement the API endpoints required for the Company and Consultancy Management features.

---

## 📋 Prerequisites

- Node.js backend (Express.js recommended)
- MongoDB or SQL database
- File upload library (Multer recommended)
- Email service (Nodemailer recommended)
- Authentication middleware (JWT recommended)

---

## 🗄️ Database Setup

### Step 1: Create Company Model

**File**: `models/Company.js`

```javascript
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: 'India'
  },
  pincode: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  sectors: [{
    type: String,
    trim: true
  }],
  departments: [{
    type: String,
    trim: true
  }],
  designation: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  foundedYear: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: null
  },
  coverPhoto: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  suspensionDuration: {
    type: Number,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
companySchema.index({ email: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ companyName: 'text', email: 'text', contactPerson: 'text' });

module.exports = mongoose.model('Company', companySchema);
```

### Step 2: Create Consultancy Model

**File**: `models/Consultancy.js`

```javascript
// Same as Company model but with different collection name
const consultancySchema = new mongoose.Schema({
  // ... same fields as Company
}, {
  timestamps: true
});

// Same indexes
consultancySchema.index({ email: 1 });
consultancySchema.index({ isActive: 1 });
consultancySchema.index({ isVerified: 1 });
consultancySchema.index({ companyName: 'text', email: 'text', contactPerson: 'text' });

module.exports = mongoose.model('Consultancy', consultancySchema);
```

---

## 🔧 Middleware Setup

### Step 1: Authentication Middleware

**File**: `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

module.exports = authMiddleware;
```

### Step 2: Admin Middleware

**File**: `middleware/admin.js`

```javascript
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = adminMiddleware;
```

### Step 3: File Upload Middleware

**File**: `middleware/upload.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = './uploads/companies';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

---

## 🛣️ Routes Implementation

### Step 1: Company Routes

**File**: `routes/admin/companies.js`

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');
const upload = require('../../middleware/upload');
const companyController = require('../../controllers/admin/companyController');

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// List and create
router.get('/', companyController.listCompanies);
router.post('/', companyController.createCompany);

// Bulk operations
router.post('/bulk/approve', companyController.bulkApprove);
router.post('/bulk/block', companyController.bulkBlock);
router.post('/bulk/delete', companyController.bulkDelete);

// Single company operations
router.get('/:id', companyController.getCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

// Status operations
router.patch('/:id/status', companyController.toggleStatus);
router.patch('/:id/verify', companyController.verifyCompany);

// Special operations
router.post('/:id/duplicate', companyController.duplicateCompany);
router.post('/:id/suspend', companyController.suspendCompany);

// File uploads
router.post('/:id/upload-profile', upload.single('image'), companyController.uploadProfile);
router.post('/:id/upload-cover', upload.single('image'), companyController.uploadCover);

// Email
router.post('/:id/send-email', companyController.sendEmail);

module.exports = router;
```

### Step 2: Consultancy Routes

**File**: `routes/admin/consultancies.js`

```javascript
// Same as company routes but use consultancyController
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const adminMiddleware = require('../../middleware/admin');
const upload = require('../../middleware/upload');
const consultancyController = require('../../controllers/admin/consultancyController');

// ... same routes as companies

module.exports = router;
```

---

## 🎮 Controller Implementation

### Company Controller

**File**: `controllers/admin/companyController.js`

```javascript
const Company = require('../../models/Company');
const Job = require('../../models/Job');
const emailService = require('../../services/emailService');

// List all companies
exports.listCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      verified = ''
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status === 'active') {
      query.isActive = true;
      query.isVerified = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'pending') {
      query.isVerified = false;
    } else if (status === 'blocked') {
      query.isActive = false;
    }
    
    if (verified === 'true') {
      query.isVerified = true;
    } else if (verified === 'false') {
      query.isVerified = false;
    }

    // Execute query with pagination
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count
    const total = await Company.countDocuments(query);

    // Calculate stats
    const stats = {
      total: await Company.countDocuments(),
      active: await Company.countDocuments({ isActive: true, isVerified: true }),
      pending: await Company.countDocuments({ isVerified: false }),
      blocked: await Company.countDocuments({ isActive: false }),
      verified: await Company.countDocuments({ isVerified: true }),
      unverified: await Company.countDocuments({ isVerified: false })
    };

    res.json({
      success: true,
      companies,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error listing companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Get company details
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select('-__v');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company jobs
    const jobs = await Job.find({ company: company._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title location status createdAt applicationsCount');

    res.json({
      success: true,
      company,
      jobs
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Optional: Delete associated jobs
    // await Job.deleteMany({ company: company._id });

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
};

// Toggle company status
exports.toggleStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive } },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company status updated successfully',
      company
    });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Verify company
exports.verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Send verification email
    await emailService.sendVerificationEmail(company.email, company.companyName);

    res.json({
      success: true,
      message: 'Company verified successfully',
      company
    });
  } catch (error) {
    console.error('Error verifying company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify company',
      error: error.message
    });
  }
};

// Duplicate company
exports.duplicateCompany = async (req, res) => {
  try {
    const original = await Company.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const duplicate = new Company({
      ...original.toObject(),
      _id: undefined,
      companyName: `${original.companyName} (Copy)`,
      email: `copy_${Date.now()}_${original.email}`,
      isVerified: false,
      verifiedAt: null,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicate.save();

    res.json({
      success: true,
      message: 'Company duplicated successfully',
      company: duplicate
    });
  } catch (error) {
    console.error('Error duplicating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate company',
      error: error.message
    });
  }
};

// Suspend company
exports.suspendCompany = async (req, res) => {
  try {
    const { reason, duration } = req.body;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason,
          suspensionDuration: duration
        }
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Send suspension email
    await emailService.sendSuspensionEmail(company.email, company.companyName, reason);

    res.json({
      success: true,
      message: 'Company suspended successfully',
      company
    });
  } catch (error) {
    console.error('Error suspending company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend company',
      error: error.message
    });
  }
};

// Upload profile photo
exports.uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/companies/${req.file.filename}`;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { profilePhoto: imageUrl } },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
};

// Upload cover photo
exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `/uploads/companies/${req.file.filename}`;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: { coverPhoto: imageUrl } },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Cover photo uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Error uploading cover photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover photo',
      error: error.message
    });
  }
};

// Send email
exports.sendEmail = async (req, res) => {
  try {
    const { emailType, customSubject, customMessage } = req.body;
    
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    switch (emailType) {
      case 'activation':
        await emailService.sendActivationEmail(company.email, company.companyName);
        break;
      case 'password-reset':
        await emailService.sendPasswordResetEmail(company.email, company.companyName);
        break;
      case 'custom':
        await emailService.sendCustomEmail(company.email, customSubject, customMessage);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type'
        });
    }

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Bulk approve
exports.bulkApprove = async (req, res) => {
  try {
    const { companyIds } = req.body;

    const result = await Company.updateMany(
      { _id: { $in: companyIds } },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Companies approved successfully',
      approved: result.modifiedCount,
      failed: companyIds.length - result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk approving:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve companies',
      error: error.message
    });
  }
};

// Bulk block
exports.bulkBlock = async (req, res) => {
  try {
    const { companyIds, reason } = req.body;

    const result = await Company.updateMany(
      { _id: { $in: companyIds } },
      {
        $set: {
          isActive: false,
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason
        }
      }
    );

    res.json({
      success: true,
      message: 'Companies blocked successfully',
      blocked: result.modifiedCount,
      failed: companyIds.length - result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk blocking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block companies',
      error: error.message
    });
  }
};

// Bulk delete
exports.bulkDelete = async (req, res) => {
  try {
    const { companyIds } = req.body;

    const result = await Company.deleteMany({
      _id: { $in: companyIds }
    });

    res.json({
      success: true,
      message: 'Companies deleted successfully',
      deleted: result.deletedCount,
      failed: companyIds.length - result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete companies',
      error: error.message
    });
  }
};
```

---

## 📧 Email Service

**File**: `services/emailService.js`

```javascript
const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send verification email
exports.sendVerificationEmail = async (email, companyName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Company Verified',
    html: `
      <h1>Congratulations!</h1>
      <p>Your company "${companyName}" has been verified.</p>
      <p>You can now access all features of our platform.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send activation email
exports.sendActivationEmail = async (email, companyName) => {
  const activationLink = `${process.env.APP_URL}/activate?email=${email}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Activate Your Account',
    html: `
      <h1>Welcome ${companyName}!</h1>
      <p>Click the link below to activate your account:</p>
      <a href="${activationLink}">Activate Account</a>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, companyName) => {
  const resetLink = `${process.env.APP_URL}/reset-password?email=${email}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${companyName},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send suspension email
exports.sendSuspensionEmail = async (email, companyName, reason) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Account Suspended',
    html: `
      <h1>Account Suspended</h1>
      <p>Hi ${companyName},</p>
      <p>Your account has been suspended.</p>
      <p>Reason: ${reason}</p>
      <p>Please contact support for more information.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send custom email
exports.sendCustomEmail = async (email, subject, message) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: subject,
    html: message
  };

  await transporter.sendMail(mailOptions);
};
```

---

## 🔗 Main App Integration

**File**: `app.js` or `server.js`

```javascript
const express = require('express');
const app = express();

// ... other middleware

// Routes
const companyRoutes = require('./routes/admin/companies');
const consultancyRoutes = require('./routes/admin/consultancies');

app.use('/api/admin/companies', companyRoutes);
app.use('/api/admin/consultancies', consultancyRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ... rest of app
```

---

## 🧪 Testing

### Test with Postman

1. **List Companies**
```
GET http://localhost:5000/api/admin/companies
Headers:
  Authorization: Bearer <admin_token>
```

2. **Get Company**
```
GET http://localhost:5000/api/admin/companies/:id
Headers:
  Authorization: Bearer <admin_token>
```

3. **Update Company**
```
PUT http://localhost:5000/api/admin/companies/:id
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json
Body:
{
  "companyName": "Updated Name",
  "email": "updated@email.com"
}
```

4. **Upload Profile Photo**
```
POST http://localhost:5000/api/admin/companies/:id/upload-profile
Headers:
  Authorization: Bearer <admin_token>
Body: form-data
  image: <select file>
```

---

## 🚀 Deployment

### Environment Variables

Create `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal

# JWT
JWT_SECRET=your_jwt_secret_key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourapp.com

# App
APP_URL=http://localhost:8080
PORT=5000
```

### Start Server

```bash
npm install
npm start
```

---

## ✅ Checklist

- [ ] Database models created
- [ ] Middleware configured
- [ ] Routes defined
- [ ] Controllers implemented
- [ ] Email service configured
- [ ] File upload working
- [ ] Environment variables set
- [ ] Server running
- [ ] Endpoints tested
- [ ] Frontend connected
- [ ] Production deployed

---

## 📞 Support

For questions or issues:
1. Review this guide
2. Check API specification
3. Test with Postman
4. Contact frontend team

---

**Happy Coding! 🚀**

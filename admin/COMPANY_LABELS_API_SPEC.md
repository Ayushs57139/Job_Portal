# Company Labels API Specification

## Overview

This document specifies the backend API endpoints required for the Company Labels feature.

## Database Schema Updates

### User Model Extension

Add the following field to the User model:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // Company Labels
  labels: {
    type: [String],
    default: [],
    enum: [
      'premium',
      'starred',
      'featured',
      'actively_hiring',
      'urgent',
      'verified_employer',
      'top_rated'
    ]
  },
  
  // Label history for tracking
  labelHistory: [{
    label: String,
    action: { type: String, enum: ['added', 'removed'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // ... existing fields
});
```

## API Endpoints

### 1. Update User Labels

**Endpoint**: `PATCH /api/admin/users/:userId/labels`

**Description**: Update labels for a specific company or consultancy

**Authentication**: Required (Admin only)

**Request Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Parameters**:
- `userId` (path parameter): The ID of the user to update

**Request Body**:
```json
{
  "labels": ["premium", "actively_hiring", "featured"]
}
```

**Validation Rules**:
- `labels` must be an array
- Each label must be one of the valid label IDs
- User must exist
- User must be an employer (role: 'EMPLOYER')
- Only admins can update labels

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Labels updated successfully",
  "user": {
    "_id": "user_id",
    "name": "Company Name",
    "email": "company@example.com",
    "role": "EMPLOYER",
    "employerType": "company",
    "labels": ["premium", "actively_hiring", "featured"],
    "updatedAt": "2026-03-05T10:30:00.000Z"
  }
}
```

**Error Responses**:

**400 Bad Request** - Invalid labels:
```json
{
  "success": false,
  "message": "Invalid label ID: invalid_label"
}
```

**403 Forbidden** - Not an admin:
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Failed to update labels",
  "error": "Error details"
}
```

### 2. Get User Labels

**Endpoint**: `GET /api/admin/users/:userId/labels`

**Description**: Get labels for a specific user

**Authentication**: Required (Admin only)

**Request Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Parameters**:
- `userId` (path parameter): The ID of the user

**Success Response** (200 OK):
```json
{
  "success": true,
  "labels": ["premium", "actively_hiring"],
  "labelDetails": [
    {
      "id": "premium",
      "name": "Premium Company",
      "color": "#FFD700",
      "icon": "star"
    },
    {
      "id": "actively_hiring",
      "name": "Actively Hiring",
      "color": "#27AE60",
      "icon": "briefcase"
    }
  ]
}
```

### 3. Get All Available Labels

**Endpoint**: `GET /api/admin/labels`

**Description**: Get list of all available label types

**Authentication**: Required (Admin only)

**Request Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "labels": [
    {
      "id": "premium",
      "name": "Premium Company",
      "description": "Premium membership companies",
      "color": "#FFD700",
      "icon": "star",
      "bgColor": "#FFF9E6"
    },
    {
      "id": "starred",
      "name": "Starred Company",
      "description": "Admin-favorited companies",
      "color": "#FF6B6B",
      "icon": "star-outline",
      "bgColor": "#FFE6E6"
    },
    {
      "id": "featured",
      "name": "Featured Company",
      "description": "Featured on homepage",
      "color": "#4A90E2",
      "icon": "ribbon",
      "bgColor": "#E6F2FF"
    },
    {
      "id": "actively_hiring",
      "name": "Actively Hiring",
      "description": "Currently hiring",
      "color": "#27AE60",
      "icon": "briefcase",
      "bgColor": "#E6F7EE"
    },
    {
      "id": "urgent",
      "name": "Urgent Company",
      "description": "Urgent hiring needs",
      "color": "#E74C3C",
      "icon": "alert-circle",
      "bgColor": "#FFE6E6"
    },
    {
      "id": "verified_employer",
      "name": "Verified Employer",
      "description": "Verified and trusted",
      "color": "#9B59B6",
      "icon": "checkmark-circle",
      "bgColor": "#F3E6FF"
    },
    {
      "id": "top_rated",
      "name": "Top Rated",
      "description": "Highly rated companies",
      "color": "#F39C12",
      "icon": "trophy",
      "bgColor": "#FFF3E0"
    }
  ]
}
```

### 4. Get Label History

**Endpoint**: `GET /api/admin/users/:userId/labels/history`

**Description**: Get label change history for a user

**Authentication**: Required (Admin only)

**Request Headers**:
```
Authorization: Bearer <admin_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "history": [
    {
      "label": "premium",
      "action": "added",
      "addedBy": {
        "_id": "admin_id",
        "name": "Admin Name"
      },
      "timestamp": "2026-03-05T10:30:00.000Z"
    },
    {
      "label": "featured",
      "action": "removed",
      "addedBy": {
        "_id": "admin_id",
        "name": "Admin Name"
      },
      "timestamp": "2026-03-04T15:20:00.000Z"
    }
  ]
}
```

## Implementation Example (Node.js/Express)

### Route Definition

```javascript
// routes/admin/users.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../../middleware/auth');
const {
  updateUserLabels,
  getUserLabels,
  getAllLabels,
  getLabelHistory
} = require('../../controllers/admin/labelController');

// Label management routes
router.patch('/:userId/labels', protect, adminOnly, updateUserLabels);
router.get('/:userId/labels', protect, adminOnly, getUserLabels);
router.get('/:userId/labels/history', protect, adminOnly, getLabelHistory);
router.get('/labels', protect, adminOnly, getAllLabels);

module.exports = router;
```

### Controller Implementation

```javascript
// controllers/admin/labelController.js
const User = require('../../models/User');

// Valid label IDs
const VALID_LABELS = [
  'premium',
  'starred',
  'featured',
  'actively_hiring',
  'urgent',
  'verified_employer',
  'top_rated'
];

// Label definitions
const LABEL_DEFINITIONS = [
  {
    id: 'premium',
    name: 'Premium Company',
    description: 'Premium membership companies',
    color: '#FFD700',
    icon: 'star',
    bgColor: '#FFF9E6'
  },
  // ... other labels
];

// Update user labels
exports.updateUserLabels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { labels } = req.body;

    // Validate labels array
    if (!Array.isArray(labels)) {
      return res.status(400).json({
        success: false,
        message: 'Labels must be an array'
      });
    }

    // Validate each label
    for (const label of labels) {
      if (!VALID_LABELS.includes(label)) {
        return res.status(400).json({
          success: false,
          message: `Invalid label ID: ${label}`
        });
      }
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is an employer
    if (user.role !== 'EMPLOYER') {
      return res.status(400).json({
        success: false,
        message: 'Labels can only be assigned to employers'
      });
    }

    // Track label changes for history
    const oldLabels = user.labels || [];
    const addedLabels = labels.filter(l => !oldLabels.includes(l));
    const removedLabels = oldLabels.filter(l => !labels.includes(l));

    // Add to history
    const historyEntries = [];
    addedLabels.forEach(label => {
      historyEntries.push({
        label,
        action: 'added',
        addedBy: req.user._id,
        timestamp: new Date()
      });
    });
    removedLabels.forEach(label => {
      historyEntries.push({
        label,
        action: 'removed',
        addedBy: req.user._id,
        timestamp: new Date()
      });
    });

    // Update user
    user.labels = labels;
    if (!user.labelHistory) {
      user.labelHistory = [];
    }
    user.labelHistory.push(...historyEntries);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Labels updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerType: user.employerType,
        labels: user.labels,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating labels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update labels',
      error: error.message
    });
  }
};

// Get user labels
exports.getUserLabels = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const labelDetails = (user.labels || []).map(labelId => {
      return LABEL_DEFINITIONS.find(l => l.id === labelId);
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      labels: user.labels || [],
      labelDetails
    });
  } catch (error) {
    console.error('Error getting labels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get labels',
      error: error.message
    });
  }
};

// Get all available labels
exports.getAllLabels = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      labels: LABEL_DEFINITIONS
    });
  } catch (error) {
    console.error('Error getting labels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get labels',
      error: error.message
    });
  }
};

// Get label history
exports.getLabelHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('labelHistory.addedBy', 'name email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      history: user.labelHistory || []
    });
  } catch (error) {
    console.error('Error getting label history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get label history',
      error: error.message
    });
  }
};
```

### Middleware

```javascript
// middleware/auth.js
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};
```

## Testing

### Test Cases

1. **Update Labels - Success**
```bash
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID/labels \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"labels": ["premium", "actively_hiring"]}'
```

2. **Update Labels - Invalid Label**
```bash
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID/labels \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"labels": ["invalid_label"]}'
```

3. **Get User Labels**
```bash
curl -X GET http://localhost:5000/api/admin/users/USER_ID/labels \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

4. **Get All Labels**
```bash
curl -X GET http://localhost:5000/api/admin/labels \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

5. **Get Label History**
```bash
curl -X GET http://localhost:5000/api/admin/users/USER_ID/labels/history \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Security Considerations

1. **Authentication**: All endpoints require valid admin token
2. **Authorization**: Only admins can manage labels
3. **Validation**: Strict validation of label IDs
4. **Audit Trail**: Label history tracks all changes
5. **Rate Limiting**: Implement rate limiting on label updates
6. **Input Sanitization**: Sanitize all inputs

## Performance Optimization

1. **Indexing**: Add index on `labels` field for faster queries
2. **Caching**: Cache label definitions
3. **Batch Updates**: Support bulk label updates
4. **Pagination**: Paginate label history

## Migration Script

```javascript
// migrations/add-labels-field.js
const User = require('../models/User');

async function addLabelsField() {
  try {
    await User.updateMany(
      { role: 'EMPLOYER', labels: { $exists: false } },
      { $set: { labels: [], labelHistory: [] } }
    );
    console.log('Labels field added to all employers');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

addLabelsField();
```

## Summary

This API specification provides complete backend implementation for the Company Labels feature. The endpoints are secure, validated, and include audit trail functionality.

### Endpoints Summary
- `PATCH /api/admin/users/:userId/labels` - Update labels
- `GET /api/admin/users/:userId/labels` - Get user labels
- `GET /api/admin/labels` - Get all available labels
- `GET /api/admin/users/:userId/labels/history` - Get label history

### Status
- ✅ Specification: Complete
- ✅ Implementation Example: Provided
- ✅ Testing Guide: Included
- ✅ Security: Covered

---

**Version**: 1.0.0
**Last Updated**: March 5, 2026

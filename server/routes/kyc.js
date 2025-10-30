const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const KYC = require('../models/KYC');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/kyc-documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF documents are allowed'));
    }
  }
});

// @route   POST /api/kyc/submit
// @desc    Submit KYC documents
// @access  Private
const submitUploadFields = upload.fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'certificateOfIncorporation', maxCount: 1 },
  { name: 'udyamMsmeCertificate', maxCount: 1 },
  { name: 'companyPanCard', maxCount: 1 },
  { name: 'companyIdCard', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'voterId', maxCount: 1 },
  { name: 'otherIdDocument', maxCount: 1 }
]);

router.post('/submit', auth, submitUploadFields, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { userType, companyType, documents } = req.body;

    // Check if user is employer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'employer') {
      return res.status(403).json({ message: 'Only employers can submit KYC documents' });
    }

    // Check if KYC already exists
    let kyc = await KYC.findOne({ userId });
    if (!kyc) {
      kyc = new KYC({
        userId,
        userType: userType || (user.employerType === 'company' ? 'company' : 'consultancy'),
        companyType: companyType || null
      });
    }

    // Update document fields
    if (documents) {
      Object.keys(documents).forEach(fieldName => {
        if (typeof documents[fieldName] === 'string') {
          const documentData = JSON.parse(documents[fieldName]);
          if (kyc.documents[fieldName]) {
            kyc.documents[fieldName].idNumber = documentData.idNumber || kyc.documents[fieldName].idNumber;
          } else {
            kyc.documents[fieldName] = {
              idNumber: documentData.idNumber || '',
              documentUrl: '',
              uploadedAt: new Date()
            };
          }
        }
      });
    }

    // Handle file uploads
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        if (file) {
          // Convert absolute path to relative URL
          const relativePath = file.path.replace(path.join(__dirname, '../'), '').replace(/\\/g, '/');
          const documentUrl = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
          
          if (kyc.documents[fieldName]) {
            kyc.documents[fieldName].documentUrl = documentUrl;
            kyc.documents[fieldName].uploadedAt = new Date();
          } else {
            kyc.documents[fieldName] = {
              idNumber: '',
              documentUrl: documentUrl,
              uploadedAt: new Date()
            };
          }
        }
      });
    }

    // Check if KYC is complete
    kyc.isComplete = kyc.checkCompleteness();
    
    if (kyc.isComplete) {
      kyc.submissionStatus = 'submitted';
      kyc.submittedAt = new Date();
      
      // Update user KYC status
      await User.findByIdAndUpdate(userId, {
        kycStatus: 'submitted'
      });
    }

    await kyc.save();

    res.json({
      message: 'KYC documents submitted successfully',
      kyc: kyc,
      isComplete: kyc.isComplete
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Server error during KYC submission' });
  }
});

// @route   POST /api/kyc/upload
// @desc    Upload KYC documents
// @access  Private
const uploadFields = upload.fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'certificateOfIncorporation', maxCount: 1 },
  { name: 'udyamMsmeCertificate', maxCount: 1 },
  { name: 'companyPanCard', maxCount: 1 },
  { name: 'companyIdCard', maxCount: 1 },
  { name: 'otherDocument', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'voterId', maxCount: 1 },
  { name: 'otherIdDocument', maxCount: 1 }
]);

router.post('/upload', auth, uploadFields, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { documentType, idNumber } = req.body;

    // Check if user is employer
    const user = await User.findById(userId);
    if (!user || user.userType !== 'employer') {
      return res.status(403).json({ message: 'Only employers can upload KYC documents' });
    }

    // Check if KYC already exists
    let kyc = await KYC.findOne({ userId });
    if (!kyc) {
      kyc = new KYC({
        userId,
        userType: user.employerType === 'company' ? 'company' : 'consultancy'
      });
    }

    // Handle uploaded file
    if (req.files && req.files[documentType]) {
      const file = req.files[documentType][0];
      if (file) {
        // Convert absolute path to relative URL
        const relativePath = file.path.replace(path.join(__dirname, '../'), '').replace(/\\/g, '/');
        const documentUrl = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
        
        kyc.documents[documentType] = {
          idNumber: idNumber || '',
          documentUrl: documentUrl,
          uploadedAt: new Date()
        };
      }
    }

    await kyc.save();

    res.json({
      message: 'Document uploaded successfully',
      documentType: documentType
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Server error during document upload' });
  }
});

// @route   GET /api/kyc/status
// @desc    Get KYC status for current user
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const kyc = await KYC.findOne({ userId }).populate('userId', 'firstName lastName email userType employerType');

    if (!kyc) {
      return res.json({
        hasKYC: false,
        status: 'not_submitted',
        message: 'No KYC documents found'
      });
    }

    res.json({
      hasKYC: true,
      kyc: kyc,
      status: kyc.submissionStatus,
      isComplete: kyc.isComplete,
      requiredDocuments: kyc.getRequiredDocuments()
    });

  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Server error while fetching KYC status' });
  }
});

// @route   GET /api/kyc/admin/all
// @desc    Get all KYC submissions for admin
// @access  Private (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, userType, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.submissionStatus = status;
    if (userType) query.userType = userType;

    const kycs = await KYC.find(query)
      .populate('userId', 'firstName lastName email userType employerType company')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await KYC.countDocuments(query);

    res.json({
      kycs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Admin KYC fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching KYC data' });
  }
});

// @route   GET /api/kyc/admin/stats
// @desc    Get KYC statistics for admin dashboard
// @access  Private (Admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const stats = await KYC.getKYCStats();
    
    // Get additional stats
    const totalKYCs = await KYC.countDocuments();
    const pendingKYCs = await KYC.countDocuments({ submissionStatus: { $in: ['submitted', 'under_review'] } });
    const verifiedKYCs = await KYC.countDocuments({ submissionStatus: 'verified' });

    res.json({
      ...stats,
      total: totalKYCs,
      pending: pendingKYCs,
      verified: verifiedKYCs
    });

  } catch (error) {
    console.error('KYC stats error:', error);
    res.status(500).json({ message: 'Server error while fetching KYC statistics' });
  }
});

// @route   PUT /api/kyc/admin/verify/:kycId
// @desc    Verify or reject KYC submission
// @access  Private (Admin only)
router.put('/admin/verify/:kycId', adminAuth, async (req, res) => {
  try {
    const { kycId } = req.params;
    const { action, rejectionReason, adminNotes } = req.body;

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ message: 'KYC submission not found' });
    }

    if (action === 'verify') {
      kyc.submissionStatus = 'verified';
      kyc.reviewedAt = new Date();
      kyc.reviewedBy = req.user._id || req.user.id;
      kyc.adminNotes = adminNotes || '';
      kyc.rejectionReason = '';

      // Update user verification status
      await User.findByIdAndUpdate(kyc.userId, {
        isEmployerVerified: true,
        verificationStatus: 'verified',
        kycStatus: 'verified'
      });

    } else if (action === 'reject') {
      kyc.submissionStatus = 'rejected';
      kyc.reviewedAt = new Date();
      kyc.reviewedBy = req.user._id || req.user.id;
      kyc.rejectionReason = rejectionReason || '';
      kyc.adminNotes = adminNotes || '';

      // Update user verification status
      await User.findByIdAndUpdate(kyc.userId, {
        isEmployerVerified: false,
        verificationStatus: 'rejected',
        kycStatus: 'rejected'
      });
    }

    await kyc.save();

    res.json({
      message: `KYC ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      kyc: kyc
    });

  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({ message: 'Server error during KYC verification' });
  }
});

// @route   GET /api/kyc/admin/download/:kycId
// @desc    Download KYC documents as ZIP
// @access  Private (Admin only)
router.get('/admin/download/:kycId', adminAuth, async (req, res) => {
  try {
    const { kycId } = req.params;
    const kyc = await KYC.findById(kycId).populate('userId', 'firstName lastName email');
    
    if (!kyc) {
      return res.status(404).json({ message: 'KYC submission not found' });
    }

    // Create ZIP file with all documents
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(`${kyc.userId.firstName}_${kyc.userId.lastName}_KYC_Documents.zip`);
    archive.pipe(res);

    // Add documents to ZIP
    const documents = kyc.documents;
    Object.keys(documents).forEach(docType => {
      const doc = documents[docType];
      if (doc && doc.documentUrl) {
        // Convert relative path to absolute
        const absolutePath = path.join(__dirname, '..', doc.documentUrl);
        if (fs.existsSync(absolutePath)) {
          const fileName = `${docType}_${doc.idNumber || 'no_id'}${path.extname(doc.documentUrl)}`;
          archive.file(absolutePath, { name: fileName });
        }
      }
    });

    await archive.finalize();

  } catch (error) {
    console.error('KYC download error:', error);
    res.status(500).json({ message: 'Server error during document download' });
  }
});

// @route   GET /api/kyc/admin/bulk-download
// @desc    Bulk download KYC documents
// @access  Private (Admin only)
router.get('/admin/bulk-download', adminAuth, async (req, res) => {
  try {
    const { status, userType } = req.query;
    
    const query = {};
    if (status) query.submissionStatus = status;
    if (userType) query.userType = userType;

    const kycs = await KYC.find(query).populate('userId', 'firstName lastName email');

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(`Bulk_KYC_Documents_${new Date().toISOString().split('T')[0]}.zip`);
    archive.pipe(res);

    // Add all KYC documents to ZIP
    for (const kyc of kycs) {
      const documents = kyc.documents;
      Object.keys(documents).forEach(docType => {
        const doc = documents[docType];
        if (doc && doc.documentUrl) {
          // Convert relative path to absolute
          const absolutePath = path.join(__dirname, '..', doc.documentUrl);
          if (fs.existsSync(absolutePath)) {
            const fileName = `${kyc.userId.firstName}_${kyc.userId.lastName}/${docType}_${doc.idNumber || 'no_id'}${path.extname(doc.documentUrl)}`;
            archive.file(absolutePath, { name: fileName });
          }
        }
      });
    }

    await archive.finalize();

  } catch (error) {
    console.error('Bulk KYC download error:', error);
    res.status(500).json({ message: 'Server error during bulk document download' });
  }
});

module.exports = router;

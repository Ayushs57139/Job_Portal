const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const WebsiteLogo = require('../models/WebsiteLogo');
const { adminAuth, requirePermission } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, SVG, WebP) are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/logos/active
// @desc    Get currently active logo (public endpoint)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const logo = await WebsiteLogo.getActiveLogo();
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'No active logo found'
      });
    }

    res.json({
      success: true,
      logo
    });
  } catch (error) {
    console.error('Get active logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Apply admin authentication to all routes
router.use(adminAuth);

// @route   GET /api/admin/logos
// @desc    Get all logos with pagination and filters
// @access  Private (Admin)
router.get('/', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const logoType = req.query.logoType || '';
    const isActive = req.query.isActive;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (logoType) {
      query.logoType = logoType;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const logos = await WebsiteLogo.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WebsiteLogo.countDocuments(query);

    res.json({
      success: true,
      logos,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get logos error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/logos/active
// @desc    Get currently active logo
// @access  Private (Admin)
router.get('/active', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.getActiveLogo();
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'No active logo found'
      });
    }

    res.json({
      success: true,
      logo
    });
  } catch (error) {
    console.error('Get active logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/logos/:id
// @desc    Get single logo by ID
// @access  Private (Admin)
router.get('/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email');

    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    res.json({
      success: true,
      logo
    });
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/logos
// @desc    Create new logo configuration
// @access  Private (Admin)
router.post('/', requirePermission('canManageSettings'), [
  body('name').notEmpty().withMessage('Logo name is required'),
  body('logoType').isIn(['text', 'image', 'combined']).withMessage('Invalid logo type'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, logoType, description, textLogo, imageLogo, combinedLogo, variants } = req.body;

    // Create logo configuration
    const logo = new WebsiteLogo({
      name,
      logoType,
      description,
      textLogo: textLogo || {},
      imageLogo: imageLogo || {},
      combinedLogo: combinedLogo || {},
      variants: variants || {},
      uploadedBy: req.user.id
    });

    await logo.save();

    res.status(201).json({
      success: true,
      message: 'Logo configuration created successfully',
      logo
    });
  } catch (error) {
    console.error('Create logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/logos/upload
// @desc    Upload logo image file
// @access  Private (Admin)
router.post('/upload', requirePermission('canManageSettings'), upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: logoUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/admin/logos/:id
// @desc    Update logo configuration
// @access  Private (Admin)
router.put('/:id', requirePermission('canManageSettings'), [
  body('name').optional().notEmpty().withMessage('Logo name cannot be empty'),
  body('logoType').optional().isIn(['text', 'image', 'combined']).withMessage('Invalid logo type'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    const { name, logoType, description, textLogo, imageLogo, combinedLogo, variants } = req.body;

    // Update logo configuration
    if (name) logo.name = name;
    if (logoType) logo.logoType = logoType;
    if (description !== undefined) logo.description = description;
    if (textLogo) logo.textLogo = { ...logo.textLogo, ...textLogo };
    if (imageLogo) logo.imageLogo = { ...logo.imageLogo, ...imageLogo };
    if (combinedLogo) logo.combinedLogo = { ...logo.combinedLogo, ...combinedLogo };
    if (variants) logo.variants = { ...logo.variants, ...variants };

    await logo.save();

    res.json({
      success: true,
      message: 'Logo updated successfully',
      logo
    });
  } catch (error) {
    console.error('Update logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/admin/logos/:id/activate
// @desc    Activate a logo (set as default)
// @access  Private (Admin)
router.put('/:id/activate', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Deactivate all other logos
    await WebsiteLogo.updateMany(
      { _id: { $ne: logo._id } },
      { isDefault: false }
    );

    // Activate this logo
    logo.isActive = true;
    logo.isDefault = true;
    await logo.save();

    res.json({
      success: true,
      message: 'Logo activated successfully',
      logo
    });
  } catch (error) {
    console.error('Activate logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/admin/logos/:id/deactivate
// @desc    Deactivate a logo
// @access  Private (Admin)
router.put('/:id/deactivate', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    logo.isActive = false;
    logo.isDefault = false;
    await logo.save();

    res.json({
      success: true,
      message: 'Logo deactivated successfully',
      logo
    });
  } catch (error) {
    console.error('Deactivate logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/logos/:id
// @desc    Delete logo configuration
// @access  Private (Admin)
router.delete('/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Don't allow deletion of the only active logo
    if (logo.isDefault) {
      const activeLogosCount = await WebsiteLogo.countDocuments({ isActive: true });
      if (activeLogosCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only active logo. Please activate another logo first.'
        });
      }
    }

    // Delete associated image files
    if (logo.imageLogo.url) {
      const imagePath = path.join(__dirname, '../uploads/logos', path.basename(logo.imageLogo.url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (logo.combinedLogo.imageUrl) {
      const imagePath = path.join(__dirname, '../uploads/logos', path.basename(logo.combinedLogo.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await WebsiteLogo.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/logos/:id/variant
// @desc    Create logo variant
// @access  Private (Admin)
router.post('/:id/variant', requirePermission('canManageSettings'), [
  body('variantName').notEmpty().withMessage('Variant name is required'),
  body('config').isObject().withMessage('Variant configuration is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    const { variantName, config } = req.body;

    await logo.createVariant(variantName, config);

    res.json({
      success: true,
      message: 'Logo variant created successfully',
      logo
    });
  } catch (error) {
    console.error('Create variant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/logos/preview/:id
// @desc    Get logo preview data
// @access  Private (Admin)
router.get('/preview/:id', requirePermission('canManageSettings'), async (req, res) => {
  try {
    const logo = await WebsiteLogo.findById(req.params.id);
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    // Generate preview data based on logo type
    let previewData = {
      logoType: logo.logoType,
      html: '',
      css: '',
      js: ''
    };

    switch (logo.logoType) {
      case 'text':
        previewData.html = `<div class="logo-text">
          <span class="logo-free" style="color: ${logo.textLogo.primaryColor}">${logo.textLogo.primaryText}</span>
          <span class="logo-job" style="color: ${logo.textLogo.secondaryColor}">${logo.textLogo.secondaryText}</span>
          ${logo.textLogo.showSwoosh ? '<div class="logo-swoosh"></div>' : ''}
        </div>`;
        
        previewData.css = `
          .logo-text {
            font-size: ${logo.textLogo.fontSize}px;
            font-weight: ${logo.textLogo.fontWeight};
            font-family: ${logo.textLogo.fontFamily};
            position: relative;
            display: inline-block;
          }
          .logo-swoosh {
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 3px;
            background: ${logo.textLogo.swooshColor};
            border-radius: 2px;
          }
        `;
        break;

      case 'image':
        previewData.html = `<img src="${logo.imageLogo.url}" 
          alt="${logo.imageLogo.altText}" 
          style="width: ${logo.imageLogo.width}px; height: ${logo.imageLogo.height}px; border-radius: ${logo.imageLogo.borderRadius}px;">`;
        break;

      case 'combined':
        previewData.html = `<div class="combined-logo" style="display: flex; align-items: center; gap: ${logo.combinedLogo.textSpacing}px;">
          <img src="${logo.combinedLogo.imageUrl}" 
            style="width: ${logo.combinedLogo.imageSize.width}px; height: ${logo.combinedLogo.imageSize.height}px;">
          <div class="logo-text">
            <span class="logo-free" style="color: ${logo.textLogo.primaryColor}">${logo.textLogo.primaryText}</span>
            <span class="logo-job" style="color: ${logo.textLogo.secondaryColor}">${logo.textLogo.secondaryText}</span>
          </div>
        </div>`;
        break;
    }

    res.json({
      success: true,
      preview: previewData
    });
  } catch (error) {
    console.error('Get preview error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;

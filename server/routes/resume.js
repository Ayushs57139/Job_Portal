const express = require('express');
const { upload, parseResumeWithAI } = require('../services/resumeParser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   POST /api/resume/parse
// @desc    Parse resume and extract user details
// @access  Public
router.post('/parse', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No resume file uploaded' 
      });
    }

    console.log('Resume uploaded:', req.file.filename);
    
    // Parse the resume
    const parsedData = await parseResumeWithAI(req.file.path);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    console.log('Resume parsed successfully:', parsedData);
    
    res.json({
      success: true,
      data: parsedData,
      message: 'Resume parsed successfully'
    });
    
  } catch (error) {
    console.error('Resume parsing error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      file: req.file ? req.file.originalname : 'N/A',
      filePath: req.file ? req.file.path : 'N/A'
    });
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    // Return error message, but truncate if too long to avoid issues
    const errorMessage = error.message || 'Failed to parse resume';
    const safeErrorMessage = errorMessage.length > 200 ? errorMessage.substring(0, 200) : errorMessage;
    
    res.status(500).json({
      success: false,
      message: safeErrorMessage
    });
  }
});

module.exports = router;

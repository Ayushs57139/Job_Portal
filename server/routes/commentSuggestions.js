const express = require('express');
const router = express.Router();
const CommentSuggestion = require('../models/CommentSuggestion');
const { auth, adminAuth } = require('../middleware/auth');

// Get comment suggestions for current user
router.get('/for-user', auth, async (req, res) => {
  try {
    const { postType = 'all', limit = 10 } = req.query;
    
    // Determine user type
    let userType = 'jobseeker';
    if (req.user.userType === 'employer') {
      userType = req.user.employerType === 'company' ? 'company' : 'consultancy';
    } else if (req.user.role === 'admin' || req.user.role === 'ADMIN') {
      userType = 'admin';
    }

    const suggestions = await CommentSuggestion.getSuggestionsForUser(
      userType,
      postType,
      parseInt(limit)
    );

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching comment suggestions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get all comment suggestions
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, userType, postType, category, isActive } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (userType) query.userType = userType;
    if (postType) query.postType = postType;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const suggestions = await CommentSuggestion.find(query)
      .sort({ usageCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName');

    const total = await CommentSuggestion.countDocuments(query);

    res.json({
      suggestions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create comment suggestion
router.post('/admin/create', adminAuth, async (req, res) => {
  try {
    const { userType, postType, suggestion, category } = req.body;

    if (!userType || !suggestion) {
      return res.status(400).json({ message: 'User type and suggestion are required' });
    }

    const commentSuggestion = new CommentSuggestion({
      userType,
      postType: postType || 'all',
      suggestion: suggestion.trim(),
      category: category || 'professional',
      createdBy: req.user.id
    });

    await commentSuggestion.save();

    res.status(201).json({
      message: 'Comment suggestion created successfully',
      suggestion: commentSuggestion
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update comment suggestion
router.put('/admin/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userType, postType, suggestion, category, isActive } = req.body;

    const commentSuggestion = await CommentSuggestion.findById(id);
    if (!commentSuggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (userType) commentSuggestion.userType = userType;
    if (postType) commentSuggestion.postType = postType;
    if (suggestion) commentSuggestion.suggestion = suggestion.trim();
    if (category) commentSuggestion.category = category;
    if (isActive !== undefined) commentSuggestion.isActive = isActive;

    await commentSuggestion.save();

    res.json({
      message: 'Comment suggestion updated successfully',
      suggestion: commentSuggestion
    });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete comment suggestion
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const commentSuggestion = await CommentSuggestion.findByIdAndDelete(id);
    if (!commentSuggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json({ message: 'Comment suggestion deleted successfully' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Increment usage count (called when user uses a suggestion)
router.post('/:id/use', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const suggestion = await CommentSuggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    await suggestion.incrementUsage();

    res.json({ message: 'Usage recorded' });
  } catch (error) {
    console.error('Error recording usage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get suggestion statistics
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalSuggestions,
      activeSuggestions,
      totalUsage,
      byUserType,
      byCategory
    ] = await Promise.all([
      CommentSuggestion.countDocuments(),
      CommentSuggestion.countDocuments({ isActive: true }),
      CommentSuggestion.aggregate([
        { $group: { _id: null, total: { $sum: '$usageCount' } } }
      ]),
      CommentSuggestion.aggregate([
        { $group: { _id: '$userType', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } }
      ]),
      CommentSuggestion.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } }
      ])
    ]);

    res.json({
      total: totalSuggestions,
      active: activeSuggestions,
      totalUsage: totalUsage[0]?.total || 0,
      byUserType,
      byCategory
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SocialUpdate = require('../models/SocialUpdate');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/social-media');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'social-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images, videos, and documents
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype.startsWith('application/pdf') ||
      file.mimetype.startsWith('application/msword') ||
      file.mimetype.startsWith('application/vnd.openxmlformats-officedocument')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/social-updates
// @desc    Create a new social update/post
// @access  Private (Admin, Company, Consultancy)
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { title, content, postType, category, tags, socialSharing, visibility, scheduledAt } = req.body;
    
    // Check if user is authorized to post
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has permission to post (admin, company, consultancy)
    const allowedTypes = ['admin', 'superadmin', 'employer'];
    if (!allowedTypes.includes(user.userType)) {
      return res.status(403).json({ message: 'You are not authorized to create social updates' });
    }

    // Determine author type
    let authorType = user.userType;
    if (user.userType === 'admin' || user.userType === 'superadmin') {
      authorType = 'admin';
    } else if (user.userType === 'employer') {
      // For employers, use employerType (company or consultancy)
      authorType = user.employerType || 'company';
    }

    // Process uploaded files
    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 'document';
        
        mediaFiles.push({
          type: fileType,
          url: `/uploads/social-media/${file.filename}`,
          filename: file.originalname,
          size: file.size,
          uploadedAt: new Date()
        });
      });
    }

    // Parse social sharing configuration
    let socialSharingConfig = {};
    if (socialSharing) {
      try {
        socialSharingConfig = typeof socialSharing === 'string' ? JSON.parse(socialSharing) : socialSharing;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid social sharing configuration' });
      }
    }

    // Determine if post should be published
    // Admin posts are always published immediately
    // Company/Consultancy posts are published by default unless explicitly set to draft
    const isAdmin = user.userType === 'admin' || user.userType === 'superadmin';
    const shouldPublish = isAdmin || (!req.body.status || req.body.status !== 'draft');
    
    // Create social update
    const socialUpdate = new SocialUpdate({
      author: req.user.id,
      authorType: authorType,
      authorName: user.userType === 'admin' || user.userType === 'superadmin' ? 
                  'FreeJobWala Admin' : 
                  user.companyName || user.consultancyName || `${user.firstName} ${user.lastName}`,
      authorLogo: user.profile?.avatar || '',
      title,
      content,
      media: mediaFiles,
      postType: postType || 'general',
      category: category || '',
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
      socialSharing: socialSharingConfig,
      visibility: visibility || 'public',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isScheduled: !!scheduledAt && new Date(scheduledAt) > new Date(),
      // Set publishing status
      isPublished: shouldPublish && !scheduledAt,
      status: shouldPublish && !scheduledAt ? 'published' : (req.body.status || 'draft'),
      // Admin posts are automatically moderated
      isModerated: isAdmin
    });

    await socialUpdate.save();

    // Populate author information
    await socialUpdate.populate('author', 'firstName lastName profile.avatar userType companyName consultancyName');

    res.status(201).json({
      message: 'Social update created successfully',
      socialUpdate
    });

  } catch (error) {
    console.error('Error creating social update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates
// @desc    Get all social updates with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      postType, 
      category, 
      authorType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      isPublished: true,
      status: 'published',
      visibility: 'public'
    };

    // Add filters
    if (postType) query.postType = postType;
    if (category) query.category = category;
    if (authorType) query.authorType = authorType;

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const socialUpdates = await SocialUpdate.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profile.avatar userType companyName consultancyName')
      .populate('comments.user', 'firstName lastName profile.avatar');

    const total = await SocialUpdate.countDocuments(query);

    res.json({
      socialUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching social updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/trending
// @desc    Get trending social updates
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;
    
    const trendingUpdates = await SocialUpdate.getTrending(parseInt(limit), parseInt(days));
    
    res.json({ socialUpdates: trendingUpdates });
  } catch (error) {
    console.error('Error fetching trending updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/category/:category
// @desc    Get social updates by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    
    const updates = await SocialUpdate.getByCategory(category, parseInt(limit), parseInt(skip));
    
    res.json({ socialUpdates: updates });
  } catch (error) {
    console.error('Error fetching updates by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/search
// @desc    Search social updates
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, skip = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const updates = await SocialUpdate.searchPosts(q, parseInt(limit), parseInt(skip));
    
    res.json({ socialUpdates: updates });
  } catch (error) {
    console.error('Error searching updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/:id
// @desc    Get a specific social update by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const socialUpdate = await SocialUpdate.findById(req.params.id)
      .populate('author', 'firstName lastName profile.avatar userType companyName consultancyName')
      .populate('comments.user', 'firstName lastName profile.avatar')
      .populate('comments.replies.user', 'firstName lastName profile.avatar');

    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    // Increment view count
    await socialUpdate.incrementViews();

    res.json({ socialUpdate });
  } catch (error) {
    console.error('Error fetching social update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/social-updates/:id
// @desc    Update a social update
// @access  Private (Author, Admin)
router.put('/:id', auth, upload.array('media', 5), async (req, res) => {
  try {
    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    // Check if user is authorized to update
    const user = await User.findById(req.user.id);
    const isAuthor = socialUpdate.author.toString() === req.user.id;
    const isAdmin = user.userType === 'admin' || user.userType === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    const { title, content, postType, category, tags, socialSharing, visibility, scheduledAt } = req.body;

    // Update fields
    if (title) socialUpdate.title = title;
    if (content) socialUpdate.content = content;
    if (postType) socialUpdate.postType = postType;
    if (category) socialUpdate.category = category;
    if (tags) {
      socialUpdate.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    if (visibility) socialUpdate.visibility = visibility;
    if (scheduledAt) {
      socialUpdate.scheduledAt = new Date(scheduledAt);
      socialUpdate.isScheduled = new Date(scheduledAt) > new Date();
    }

    // Handle social sharing configuration
    if (socialSharing) {
      try {
        socialUpdate.socialSharing = typeof socialSharing === 'string' ? JSON.parse(socialSharing) : socialSharing;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid social sharing configuration' });
      }
    }

    // Handle new media files
    if (req.files && req.files.length > 0) {
      const newMediaFiles = [];
      req.files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype.startsWith('video/') ? 'video' : 'document';
        
        newMediaFiles.push({
          type: fileType,
          url: `/uploads/social-media/${file.filename}`,
          filename: file.originalname,
          size: file.size,
          uploadedAt: new Date()
        });
      });
      socialUpdate.media = [...socialUpdate.media, ...newMediaFiles];
    }

    await socialUpdate.save();
    await socialUpdate.populate('author', 'firstName lastName profile.avatar userType companyName consultancyName');

    res.json({
      message: 'Social update updated successfully',
      socialUpdate
    });

  } catch (error) {
    console.error('Error updating social update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/social-updates/:id
// @desc    Delete a social update
// @access  Private (Author, Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    // Check if user is authorized to delete
    const user = await User.findById(req.user.id);
    const isAuthor = socialUpdate.author.toString() === req.user.id;
    const isAdmin = user.userType === 'admin' || user.userType === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    // Delete associated media files
    if (socialUpdate.media && socialUpdate.media.length > 0) {
      socialUpdate.media.forEach(media => {
        const filePath = path.join(__dirname, '../uploads/social-media', path.basename(media.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await SocialUpdate.findByIdAndDelete(req.params.id);

    res.json({ message: 'Social update deleted successfully' });

  } catch (error) {
    console.error('Error deleting social update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:id/like
// @desc    Like/Unlike a social update
// @route   POST /api/social-updates/:id/like
// @desc    Like/Unlike a social update with reaction type
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { likeType = 'thumb' } = req.body;
    
    // Validate like type
    const validLikeTypes = ['thumb', 'celebrate', 'support', 'love', 'insightful', 'funny'];
    if (!validLikeTypes.includes(likeType)) {
      return res.status(400).json({ message: 'Invalid like type' });
    }

    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    await socialUpdate.toggleLike(req.user.id, likeType);
    
    // Get like counts by type
    const likeCounts = socialUpdate.getLikeCounts();

    res.json({
      message: 'Like status updated',
      likes: socialUpdate.engagement.likes,
      likeCounts: likeCounts,
      isLiked: socialUpdate.likedBy.some(id => id.toString() === req.user.id.toString()),
      userLikeType: socialUpdate.likes.find(like => like.user.toString() === req.user.id.toString())?.likeType || null
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:id/comment
// @desc    Add a comment to a social update with optional suggestion
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content, isSuggested = false, suggestionId = null } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    // Get user information to check user type
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check comment settings based on user type
    const isCandidate = user.userType === 'candidate' || user.userType === 'jobseeker';
    const isEmployer = user.userType === 'company' || user.userType === 'consultancy';

    if (isCandidate && !socialUpdate.commentSettings.candidateCommentsEnabled) {
      return res.status(403).json({ 
        message: 'Comments from candidates are currently disabled for this post' 
      });
    }

    if (isEmployer && !socialUpdate.commentSettings.employerCommentsEnabled) {
      return res.status(403).json({ 
        message: 'Comments from employers are currently disabled for this post' 
      });
    }

    await socialUpdate.addComment(req.user.id, content, isSuggested, suggestionId);
    await socialUpdate.populate('comments.user', 'firstName lastName profile.avatar userType employerType');

    const newComment = socialUpdate.comments[socialUpdate.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
      totalComments: socialUpdate.engagement.comments
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:id/share
// @desc    Share a social update
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({ message: 'Platform is required' });
    }

    // Validate platform
    const validPlatforms = ['whatsapp', 'telegram', 'instagram', 'linkedin', 'facebook', 'twitter', 'arattai', 'gmail', 'zoho', 'outlook', 'copy_link', 'save_file', 'other'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    await socialUpdate.addShare(req.user.id, platform);

    res.json({
      message: 'Post shared successfully',
      shares: socialUpdate.engagement.shares,
      platform: platform
    });

  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:id/repost
// @desc    Repost a social update (simple or with thoughts)
// @access  Private
router.post('/:id/repost', auth, async (req, res) => {
  try {
    const { repostType = 'simple', thoughts = '' } = req.body;
    
    // Validate repost type
    if (!['simple', 'with_thoughts'].includes(repostType)) {
      return res.status(400).json({ message: 'Invalid repost type. Must be "simple" or "with_thoughts"' });
    }

    if (repostType === 'with_thoughts' && !thoughts.trim()) {
      return res.status(400).json({ message: 'Thoughts are required for repost with thoughts' });
    }

    const originalPost = await SocialUpdate.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    // Add repost to original post
    await originalPost.addRepost(req.user.id, repostType, thoughts);

    // Get user info
    const user = await User.findById(req.user.id);
    
    // Create new post as repost
    const repost = new SocialUpdate({
      author: req.user.id,
      authorType: user.userType === 'employer' ? user.employerType : user.userType,
      authorName: user.userType === 'employer' ? (user.companyName || user.consultancyName) : `${user.firstName} ${user.lastName}`,
      authorLogo: user.profile?.logo || user.profile?.avatar || '',
      title: repostType === 'with_thoughts' ? `Repost: ${originalPost.title}` : originalPost.title,
      content: repostType === 'with_thoughts' ? `${thoughts}\n\n--- Original Post ---\n${originalPost.content}` : originalPost.content,
      postType: originalPost.postType,
      category: originalPost.category,
      tags: originalPost.tags,
      isRepost: true,
      originalPost: originalPost._id,
      visibility: 'public',
      status: 'published',
      isPublished: true
    });

    await repost.save();
    await repost.populate('author', 'firstName lastName profile.avatar userType employerType');
    await repost.populate('originalPost', 'title author authorName');

    res.status(201).json({
      message: 'Post reposted successfully',
      repost: repost,
      originalPostReposts: originalPost.repostCount
    });

  } catch (error) {
    console.error('Error reposting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/:id/like-counts
// @desc    Get like counts by type for a post
// @access  Public
router.get('/:id/like-counts', async (req, res) => {
  try {
    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    const likeCounts = socialUpdate.getLikeCounts();

    res.json({
      likeCounts,
      totalLikes: socialUpdate.engagement.likes
    });

  } catch (error) {
    console.error('Error getting like counts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:postId/comment/:commentId/like
// @desc    Like/Unlike a comment with reaction type
// @access  Private
router.post('/:postId/comment/:commentId/like', auth, async (req, res) => {
  try {
    const { likeType = 'thumb' } = req.body;
    
    // Validate like type
    const validLikeTypes = ['thumb', 'celebrate', 'support', 'love', 'insightful', 'funny'];
    if (!validLikeTypes.includes(likeType)) {
      return res.status(400).json({ message: 'Invalid like type' });
    }

    const socialUpdate = await SocialUpdate.findById(req.params.postId);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    const comment = socialUpdate.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already liked
    const existingLikeIndex = comment.likes.findIndex(like => like.user.toString() === req.user.id.toString());
    
    if (existingLikeIndex > -1) {
      // Check if same like type - then unlike
      if (comment.likes[existingLikeIndex].likeType === likeType) {
        comment.likes.splice(existingLikeIndex, 1);
        comment.likedBy = comment.likedBy.filter(id => id.toString() !== req.user.id.toString());
        comment.likeCount = Math.max(0, comment.likeCount - 1);
      } else {
        // Change like type
        comment.likes[existingLikeIndex].likeType = likeType;
        comment.likes[existingLikeIndex].createdAt = new Date();
      }
    } else {
      // Add new like
      comment.likes.push({
        user: req.user.id,
        likeType: likeType,
        createdAt: new Date()
      });
      comment.likedBy.push(req.user.id);
      comment.likeCount += 1;
    }

    await socialUpdate.save();

    res.json({
      message: 'Comment like status updated',
      likeCount: comment.likeCount,
      isLiked: comment.likedBy.some(id => id.toString() === req.user.id.toString()),
      userLikeType: comment.likes.find(like => like.user.toString() === req.user.id.toString())?.likeType || null
    });

  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/social-updates/:postId/comment/:commentId/reply
// @desc    Reply to a comment
// @access  Private
router.post('/:postId/comment/:commentId/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const socialUpdate = await SocialUpdate.findById(req.params.postId);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    await socialUpdate.addReply(req.params.commentId, req.user.id, content);
    await socialUpdate.populate('comments.replies.user', 'firstName lastName profile.avatar userType employerType');

    const comment = socialUpdate.comments.id(req.params.commentId);
    const newReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/user/:userId
// @desc    Get social updates by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const socialUpdates = await SocialUpdate.find({
      author: userId,
      isPublished: true,
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'firstName lastName profile.avatar userType companyName consultancyName');

    const total = await SocialUpdate.countDocuments({
      author: userId,
      isPublished: true,
      status: 'published'
    });

    res.json({
      socialUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/user/me
// @desc    Get current user's social updates
// @access  Private (Authenticated users)
router.get('/user/me', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      postType,
      search 
    } = req.query;

    const query = { author: req.user.id };
    
    if (status) query.status = status;
    if (postType) query.postType = postType;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const socialUpdates = await SocialUpdate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profile.avatar userType companyName consultancyName');

    const total = await SocialUpdate.countDocuments(query);

    res.json({
      socialUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/public/all
// @desc    Get all social updates for public access (no auth required)
// @access  Public
router.get('/public/all', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      authorType, 
      postType,
      search 
    } = req.query;

    const query = {}; // Get all social updates regardless of status
    
    if (status) query.status = status;
    if (authorType) query.authorType = authorType;
    if (postType) query.postType = postType;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { authorName: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const socialUpdates = await SocialUpdate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SocialUpdate.countDocuments(query);

    res.json({
      socialUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching public social updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/social-updates/admin/all
// @desc    Get all social updates for admin management
// @access  Private (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      authorType, 
      postType,
      search 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (authorType) query.authorType = authorType;
    if (postType) query.postType = postType;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { authorName: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const socialUpdates = await SocialUpdate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profile.avatar userType companyName consultancyName');

    const total = await SocialUpdate.countDocuments(query);

    res.json({
      socialUpdates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin updates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/social-updates/admin/:id/moderate
// @desc    Moderate a social update (Admin only)
// @access  Private (Admin only)
router.put('/admin/:id/moderate', adminAuth, async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'approve', 'reject', 'feature', 'pin'
    
    const socialUpdate = await SocialUpdate.findById(req.params.id);
    
    if (!socialUpdate) {
      return res.status(404).json({ message: 'Social update not found' });
    }

    switch (action) {
      case 'approve':
        socialUpdate.isModerated = true;
        socialUpdate.isPublished = true;
        socialUpdate.status = 'published';
        break;
      case 'reject':
        socialUpdate.isModerated = true;
        socialUpdate.isPublished = false;
        socialUpdate.status = 'archived';
        break;
      case 'feature':
        socialUpdate.isFeatured = !socialUpdate.isFeatured;
        break;
      case 'pin':
        socialUpdate.isPinned = !socialUpdate.isPinned;
        break;
      default:
        return res.status(400).json({ message: 'Invalid moderation action' });
    }

    socialUpdate.moderatedBy = req.user.id;
    socialUpdate.moderatedAt = new Date();
    if (notes) socialUpdate.moderationNotes = notes;

    await socialUpdate.save();

    res.json({
      message: `Social update ${action}ed successfully`,
      socialUpdate
    });

  } catch (error) {
    console.error('Error moderating update:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

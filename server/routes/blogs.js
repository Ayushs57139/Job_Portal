const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// GET /api/blogs - Get all published blogs (public)
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            search, 
            featured,
            sortBy = 'publishedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { published: true };

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await Blog.find(query)
            .select('-content') // Exclude full content for list view
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBlogs: total,
                hasNext: skip + blogs.length < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
});

// GET /api/blogs/featured - Get featured blogs (public)
router.get('/featured', async (req, res) => {
    try {
        const { limit = 4 } = req.query;

        const blogs = await Blog.find({ 
            published: true, 
            featured: true 
        })
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit));

        res.json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error('Error fetching featured blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured blogs',
            error: error.message
        });
    }
});

// GET /api/blogs/:id - Get single blog by ID or slug (public)
router.get('/:id', async (req, res) => {
    try {
        const identifier = req.params.id;
        let blog;

        console.log('Blog route - Received identifier:', identifier);
        console.log('Blog route - Is valid ObjectId?', mongoose.Types.ObjectId.isValid(identifier));

        // Check if identifier is a valid ObjectId (24 hex characters)
        const isValidObjectId = mongoose.Types.ObjectId.isValid(identifier) && 
                                identifier.length === 24 && 
                                /^[0-9a-fA-F]{24}$/.test(identifier);

        if (isValidObjectId) {
            // If it's a valid ObjectId, try to find by _id first
            console.log('Blog route - Searching by ObjectId:', identifier);
            blog = await Blog.findById(identifier);
            
            // If not found by _id, try by slug as fallback
            if (!blog) {
                console.log('Blog route - Not found by _id, trying by slug');
                blog = await Blog.findOne({ slug: identifier });
            }
        } else {
            // If it's not a valid ObjectId (likely a slug), only search by slug
            console.log('Blog route - Searching by slug:', identifier);
            blog = await Blog.findOne({ slug: identifier });
        }

        if (!blog) {
            console.log('Blog route - Blog not found');
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (!blog.published) {
            console.log('Blog route - Blog exists but not published');
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        console.log('Blog route - Blog found successfully:', blog.title);
        res.json({
            success: true,
            blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
});

// GET /api/blogs/slug/:slug - Get single blog by slug (public)
router.get('/slug/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug,
            published: true 
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.json({
            success: true,
            blog
        });
    } catch (error) {
        console.error('Error fetching blog by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
});

// POST /api/blogs - Create new blog (admin, company, consultancy)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user has permission to create blogs
        const allowedUserTypes = ['admin', 'superadmin', 'employer'];
        if (!allowedUserTypes.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only Admin, Company, and Consultancy can create blogs.'
            });
        }

        const {
            title,
            excerpt,
            content,
            category,
            author,
            image,
            imageUrl,
            readTime,
            tags,
            featured,
            published,
            seoTitle,
            seoDescription
        } = req.body;

        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }
        
        if (!excerpt || !excerpt.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Excerpt is required'
            });
        }
        
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }
        
        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        // Set author name based on user type
        let authorName = author;
        let authorType = req.user.userType;
        
        if (!authorName) {
            if (req.user.userType === 'admin' || req.user.userType === 'superadmin') {
                authorName = req.user.companyName || `${req.user.firstName} ${req.user.lastName}` || 'Admin';
                authorType = 'admin';
            } else if (req.user.userType === 'employer') {
                // For employers, use employerType (company or consultancy)
                authorType = req.user.employerType || 'company';
                authorName = req.user.companyName || req.user.consultancyName || `${req.user.firstName} ${req.user.lastName}` || 'Company';
            }
        }

        // Only admin can mark blogs as featured
        const isAdmin = req.user.userType === 'admin' || req.user.userType === 'superadmin';
        const isFeatured = isAdmin ? (featured || false) : false;
        
        // Admin blogs are always published by default
        // Company/Consultancy blogs can be published or draft
        const shouldPublish = isAdmin ? (published !== undefined ? published : true) : (published !== undefined ? published : true);

        // Get authorId - ensure it's a valid MongoDB ObjectId
        // The auth middleware sets req.user to the full user document
        // Sometimes req.user._id might be the userId string instead of MongoDB ObjectId
        const User = require('../models/User');
        let authorId = req.user._id;
        
        // Check if _id is actually the userId string (starts with "JW")
        // This can happen if the user object was serialized incorrectly or JWT contains userId
        if (authorId && typeof authorId === 'string' && authorId.startsWith('JW')) {
            // This is the userId string, not the _id - find the user to get the real _id
            console.log('Detected userId string instead of _id, looking up user by userId:', authorId);
            const userDoc = await User.findOne({ userId: authorId }).select('_id');
            if (userDoc && userDoc._id) {
                authorId = userDoc._id;
                console.log('Found user _id:', authorId);
            } else {
                console.error('User not found with userId:', authorId);
                return res.status(400).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }
        }
        
        // If _id is undefined, null, or not a valid ObjectId, try to get it from userId
        if (!authorId || (typeof authorId === 'string' && !mongoose.Types.ObjectId.isValid(authorId))) {
            console.log('_id is invalid, trying to find user by userId...');
            if (req.user.userId) {
                const userDoc = await User.findOne({ userId: req.user.userId }).select('_id');
                if (userDoc && userDoc._id) {
                    authorId = userDoc._id;
                    console.log('Found user _id by userId lookup:', authorId);
                } else {
                    console.error('User not found with userId:', req.user.userId);
                    return res.status(400).json({
                        success: false,
                        message: 'User ID not found. Please login again.'
                    });
                }
            } else {
                console.error('No userId available in req.user');
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found. Please login again.'
                });
            }
        }
        
        // Ensure it's a valid ObjectId (convert string to ObjectId if needed)
        if (typeof authorId === 'string' && mongoose.Types.ObjectId.isValid(authorId) && !authorId.startsWith('JW')) {
            authorId = new mongoose.Types.ObjectId(authorId);
        } else if (!(authorId instanceof mongoose.Types.ObjectId)) {
            // If it's still not a valid ObjectId, return error
            console.error('Invalid authorId format:', authorId, 'type:', typeof authorId);
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format. Please login again.'
            });
        }

        // Validate category against enum
        const validCategories = ['Career Tips', 'Interview Prep', 'Workplace Trends', 'Networking', 'Resume Writing', 'Job Search', 'Salary Negotiation', 'Industry News', 'Professional Development', 'Work-Life Balance'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const blog = new Blog({
            title,
            excerpt,
            content,
            category,
            author: authorName,
            authorId: authorId,
            authorType: authorType,
            image: image || '📚',
            imageUrl: imageUrl || '',
            readTime: readTime || '5 min read',
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            featured: isFeatured,
            published: shouldPublish,
            publishedAt: shouldPublish ? new Date() : undefined,
            seoTitle: seoTitle || '',
            seoDescription: seoDescription || ''
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', req.body);
        console.error('User:', req.user ? { id: req.user._id, userType: req.user.userType } : 'No user');
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message).join(', ');
            return res.status(400).json({
                success: false,
                message: `Validation error: ${messages}`,
                error: error.message
            });
        }
        
        // Handle duplicate key errors (e.g., duplicate slug)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A blog with this title already exists. Please use a different title.',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
});

// PUT /api/blogs/:id - Update blog (author or admin)
router.put('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if user has permission to update (owner or admin)
        const isAdmin = req.user.userType === 'admin' || req.user.userType === 'superadmin';
        const userId = req.user._id || req.user.id;
        const isOwner = blog.authorId && blog.authorId.toString() === userId.toString();

        // Admin can edit any blog, others can only edit their own
        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only edit your own blogs.'
            });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.authorId;
        delete updateData.authorType;

        // Only admin can update featured status
        if (!isAdmin) {
            delete updateData.featured;
        }
        
        // If admin is updating and blog is being published, update publishedAt
        if (isAdmin && updateData.published === true && !blog.published) {
            updateData.publishedAt = new Date();
        }

        Object.assign(blog, updateData);
        await blog.save();

        res.json({
            success: true,
            message: 'Blog updated successfully',
            blog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
});

// DELETE /api/blogs/:id - Delete blog (author or admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if user has permission to delete (owner or admin)
        const isAdmin = req.user.userType === 'admin' || req.user.userType === 'superadmin';
        const userId = req.user._id || req.user.id;
        const isOwner = blog.authorId && blog.authorId.toString() === userId.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own blogs.'
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
});

// GET /api/blogs/admin/all - Get all blogs for admin (including unpublished)
router.get('/admin/all', adminAuth, async (req, res) => {
    try {

        const { 
            page, 
            limit, 
            category, 
            search, 
            published,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by published status
        if (published !== undefined) {
            query.published = published === 'true';
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // For admin, fetch all blogs by default (no pagination unless explicitly requested)
        // Only apply pagination if both page and limit are provided as valid numbers
        const pageNum = page ? parseInt(page) : null;
        const limitNum = limit ? parseInt(limit) : null;
        const hasPagination = pageNum !== null && limitNum !== null && !isNaN(pageNum) && !isNaN(limitNum) && pageNum > 0 && limitNum > 0;
        
        console.log(`Admin blogs fetch - Query params: page=${page}, limit=${limit}, pageNum=${pageNum}, limitNum=${limitNum}, hasPagination=${hasPagination}`);
        
        let blogs;
        let total = await Blog.countDocuments(query);
        
        console.log(`Admin blogs fetch - Total blogs matching query: ${total}`);
        
        if (hasPagination) {
            // Pagination requested
            const skip = (pageNum - 1) * limitNum;
            blogs = await Blog.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum);
            
            console.log(`Admin blogs fetch (paginated) - Page: ${pageNum}, Limit: ${limitNum}, Total: ${total}, Returning: ${blogs.length}`);
            
            res.json({
                success: true,
                blogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(total / limitNum),
                    totalBlogs: total,
                    hasNext: skip + blogs.length < total,
                    hasPrev: pageNum > 1
                }
            });
        } else {
            // No pagination - return ALL blogs (DO NOT apply .limit())
            blogs = await Blog.find(query)
                .sort(sortOptions)
                .lean(); // Use lean() for better performance with large datasets

            console.log(`Admin blogs fetch (all) - Total blogs in DB: ${total}, Returning: ${blogs.length}, Query:`, JSON.stringify(query));
            
            if (blogs.length !== total) {
                console.warn(`WARNING: Expected ${total} blogs but got ${blogs.length}. This might indicate a query issue.`);
            }
            
            res.json({
                success: true,
                blogs,
                total: total
            });
        }
    } catch (error) {
        console.error('Error fetching admin blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin blogs',
            error: error.message
        });
    }
});

module.exports = router;
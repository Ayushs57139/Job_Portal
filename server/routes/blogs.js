const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');

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
        // Try to find by ID first, then by slug
        const blog = await Blog.findOne({
            $or: [
                { _id: req.params.id },
                { slug: req.params.id }
            ]
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (!blog.published) {
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
        console.error('Error fetching blog:', error);
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
        const allowedUserTypes = ['admin', 'superadmin', 'company', 'consultancy'];
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
        if (!title || !excerpt || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, excerpt, content, and category are required'
            });
        }

        // Set author name based on user type
        let authorName = author;
        if (!authorName) {
            if (req.user.userType === 'admin' || req.user.userType === 'superadmin') {
                authorName = req.user.companyName || req.user.fullName || 'Admin';
            } else if (req.user.userType === 'company') {
                authorName = req.user.companyName || req.user.fullName || 'Company';
            } else if (req.user.userType === 'consultancy') {
                authorName = req.user.companyName || req.user.fullName || 'Consultancy';
            }
        }

        // Only admin can mark blogs as featured
        const isFeatured = (req.user.userType === 'admin' || req.user.userType === 'superadmin') ? 
            (featured || false) : false;

        const blog = new Blog({
            title,
            excerpt,
            content,
            category,
            author: authorName,
            authorId: req.user.userId,
            authorType: req.user.userType,
            image: image || '📚',
            imageUrl,
            readTime: readTime || '5 min read',
            tags: tags || [],
            featured: isFeatured,
            published: published !== undefined ? published : true,
            seoTitle,
            seoDescription
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
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
        const isOwner = blog.authorId.toString() === req.user.userId.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only edit your own blogs.'
            });
        }

        const updateData = req.body;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.authorId;
        delete updateData.authorType;

        // Only admin can update featured status
        if (!isAdmin) {
            delete updateData.featured;
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
        const isOwner = blog.authorId.toString() === req.user.userId.toString();

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

// GET /api/admin/blogs - Get all blogs for admin (including unpublished)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Check if user is admin or superadmin
        if (req.user.userType !== 'admin' && req.user.userType !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { 
            page = 1, 
            limit = 10, 
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

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await Blog.find(query)
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
        console.error('Error fetching admin blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin blogs',
            error: error.message
        });
    }
});

module.exports = router;
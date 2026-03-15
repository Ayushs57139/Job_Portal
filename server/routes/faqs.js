const express = require('express');
const { body, validationResult } = require('express-validator');
const FAQ = require('../models/FAQ');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

const validate = [
  body('question').notEmpty().trim().withMessage('Question is required'),
  body('answer').notEmpty().trim().withMessage('Answer is required'),
  body('category').notEmpty().trim().withMessage('Category is required'),
];

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/faqs - all active FAQs grouped by category
router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (search) query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } }
    ];

    const faqs = await FAQ.find(query).sort({ category: 1, order: 1, createdAt: 1 });

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.json({ success: true, data: faqs, grouped, total: faqs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/faqs/categories - distinct active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category', { isActive: true });
    res.json({ success: true, data: categories.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/faqs/admin/list
router.get('/admin/list', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 100, category, search, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) query.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } }
    ];

    const faqs = await FAQ.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ category: 1, order: 1, createdAt: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await FAQ.countDocuments(query);
    const categories = await FAQ.distinct('category');

    res.json({ success: true, data: faqs, total, categories: categories.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/faqs/admin/stats
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const [total, active, featured, byCategory] = await Promise.all([
      FAQ.countDocuments(),
      FAQ.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isFeatured: true }),
      FAQ.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);
    res.json({ success: true, data: { total, active, inactive: total - active, featured, byCategory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/faqs/admin/create
router.post('/admin/create', adminAuth, validate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const faq = new FAQ({ ...req.body, createdBy: req.user.id });
    await faq.save();
    res.status(201).json({ success: true, message: 'FAQ created', data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/faqs/admin/:id
router.put('/admin/:id', adminAuth, validate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, message: 'FAQ updated', data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/faqs/admin/:id/toggle
router.put('/admin/:id/toggle', adminAuth, async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    faq.isActive = !faq.isActive;
    faq.lastModifiedBy = req.user.id;
    await faq.save();
    res.json({ success: true, message: `FAQ ${faq.isActive ? 'activated' : 'deactivated'}`, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/faqs/admin/:id
router.delete('/admin/:id', adminAuth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/faqs/admin/reorder - bulk reorder
router.put('/admin/reorder', adminAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    await Promise.all(items.map(({ id, order }) => FAQ.findByIdAndUpdate(id, { order })));
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

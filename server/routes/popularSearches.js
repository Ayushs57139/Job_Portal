const express = require('express');
const router = express.Router();
const PopularSearch = require('../models/PopularSearch');

// @route   GET /api/popular-searches
// @desc    Get popular searches
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularSearches = await PopularSearch.getPopularSearches(parseInt(limit));
    
    res.json({
      success: true,
      popularSearches
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular searches'
    });
  }
});

// @route   POST /api/popular-searches/:id/click
// @desc    Track click on popular search
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    
    await PopularSearch.findByIdAndUpdate(id, {
      $inc: { clickCount: 1 }
    });
    
    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click'
    });
  }
});

// @route   POST /api/popular-searches/track-search
// @desc    Track a search query
// @access  Public
router.post('/track-search', async (req, res) => {
  try {
    const { searchQuery } = req.body;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Find or create popular search
    let popularSearch = await PopularSearch.findOne({ searchQuery });
    
    if (popularSearch) {
      await PopularSearch.incrementSearchCount(searchQuery);
    } else {
      // Optionally create a new popular search entry
      // This can be done manually by admin or automatically for certain patterns
    }
    
    res.json({
      success: true,
      message: 'Search tracked'
    });
  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking search'
    });
  }
});

module.exports = router;


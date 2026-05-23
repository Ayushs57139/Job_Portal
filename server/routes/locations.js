const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { auth } = require('../middleware/auth');

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.userType !== 'admin' && req.user.userType !== 'superadmin')) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// GET all locations (public)
router.get('/', async (req, res) => {
  try {
    const { search, state, type, limit = 100, page = 1 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) query.state = { $regex: state, $options: 'i' };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [locations, total] = await Promise.all([
      Location.find(query).sort({ city: 1 }).skip(skip).limit(parseInt(limit)),
      Location.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: locations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      message: 'Locations retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Error fetching locations' });
  }
});

// GET distinct states (public)
router.get('/states', async (req, res) => {
  try {
    const states = await Location.distinct('state');
    res.json({ success: true, data: states.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching states' });
  }
});

// POST new location (admin)
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { city, state, country = 'India', type = 'Other', pincode } = req.body;
    if (!city || !state) {
      return res.status(400).json({ success: false, message: 'City and state are required' });
    }
    const existing = await Location.findOne({ city: { $regex: `^${city}$`, $options: 'i' }, state: { $regex: `^${state}$`, $options: 'i' } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Location already exists' });
    }
    const location = await Location.create({ city, state, country, type, pincode });
    res.status(201).json({ success: true, data: location, message: 'Location added successfully' });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ success: false, message: 'Error adding location' });
  }
});

// PUT update location (admin)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location, message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating location' });
  }
});

// DELETE location (admin)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting location' });
  }
});

module.exports = router;

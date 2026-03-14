const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const { adminAuth } = require('../middleware/adminAuth');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  }
});

// @route   GET /api/admin/locations
// @desc    Get all locations
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { search, state, country, isActive } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { district: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { fullLocation: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (state) {
      query.stateLower = state.toLowerCase();
    }
    
    if (country) {
      query.countryLower = country.toLowerCase();
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const locations = await Location.find(query).sort({ country: 1, state: 1, city: 1, district: 1 });
    
    res.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/locations/search
// @desc    Search locations for frontend (public)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ locations: [] });
    }

    const locations = await Location.find({
      isActive: true,
      $or: [
        { district: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { state: { $regex: q, $options: 'i' } },
        { fullLocation: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .select('district city state country fullLocation')
    .sort({ city: 1, district: 1 });
    
    res.json({ locations });
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/locations/states
// @desc    Get all unique states
// @access  Public
router.get('/states', async (req, res) => {
  try {
    const { country = 'India' } = req.query;
    
    const states = await Location.distinct('state', { 
      countryLower: country.toLowerCase(),
      isActive: true 
    });
    
    res.json({ states: states.sort() });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/locations/cities
// @desc    Get cities by state
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const { state, country = 'India' } = req.query;
    
    if (!state) {
      return res.status(400).json({ message: 'State is required' });
    }
    
    const cities = await Location.distinct('city', { 
      stateLower: state.toLowerCase(),
      countryLower: country.toLowerCase(),
      isActive: true 
    });
    
    res.json({ cities: cities.sort() });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/locations/districts
// @desc    Get districts by city
// @access  Public
router.get('/districts', async (req, res) => {
  try {
    const { city, state, country = 'India' } = req.query;
    
    if (!city || !state) {
      return res.status(400).json({ message: 'City and state are required' });
    }
    
    const districts = await Location.distinct('district', { 
      cityLower: city.toLowerCase(),
      stateLower: state.toLowerCase(),
      countryLower: country.toLowerCase(),
      isActive: true 
    });
    
    res.json({ districts: districts.sort() });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/locations
// @desc    Create new location
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { district, city, state, country, isActive } = req.body;
    
    if (!district || !city || !state || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if location already exists
    const existing = await Location.findOne({
      districtLower: district.toLowerCase(),
      cityLower: city.toLowerCase(),
      stateLower: state.toLowerCase(),
      countryLower: country.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({ message: 'Location already exists' });
    }

    const location = await Location.create({
      district,
      city,
      state,
      country,
      isActive: isActive !== false
    });
    
    res.status(201).json({ location });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/locations/:id
// @desc    Update location
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { district, city, state, country, isActive } = req.body;
    
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if updated location conflicts with existing
    if (district || city || state || country) {
      const checkDistrict = district || location.district;
      const checkCity = city || location.city;
      const checkState = state || location.state;
      const checkCountry = country || location.country;

      const existing = await Location.findOne({
        _id: { $ne: req.params.id },
        districtLower: checkDistrict.toLowerCase(),
        cityLower: checkCity.toLowerCase(),
        stateLower: checkState.toLowerCase(),
        countryLower: checkCountry.toLowerCase()
      });

      if (existing) {
        return res.status(400).json({ message: 'Location already exists' });
      }
    }

    if (district) location.district = district;
    if (city) location.city = city;
    if (state) location.state = state;
    if (country) location.country = country;
    if (isActive !== undefined) location.isActive = isActive;

    await location.save();
    
    res.json({ location });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/locations/:id
// @desc    Delete location
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/locations/bulk-import
// @desc    Bulk import locations from Excel/CSV
// @access  Private (Admin)
router.post('/bulk-import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const row of data) {
      try {
        const district = row.District || row.district;
        const city = row.City || row.city;
        const state = row.State || row.state;
        const country = row.Country || row.country || 'India';

        if (!district || !city || !state || !country) {
          skipped++;
          errors.push(`Row skipped: Missing required fields`);
          continue;
        }

        // Check if location exists
        const existing = await Location.findOne({
          districtLower: district.toLowerCase(),
          cityLower: city.toLowerCase(),
          stateLower: state.toLowerCase(),
          countryLower: country.toLowerCase()
        });

        if (existing) {
          skipped++;
          continue;
        }

        await Location.create({
          district,
          city,
          state,
          country,
          isActive: true
        });

        imported++;
      } catch (error) {
        skipped++;
        errors.push(`Error importing row: ${error.message}`);
      }
    }

    res.json({
      success: true,
      imported,
      skipped,
      total: data.length,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Error importing locations:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/admin/locations/bulk-export
// @desc    Export all locations to Excel
// @access  Private (Admin)
router.get('/bulk-export', adminAuth, async (req, res) => {
  try {
    const locations = await Location.find().sort({ country: 1, state: 1, city: 1, district: 1 });

    const data = locations.map(loc => ({
      District: loc.district,
      City: loc.city,
      State: loc.state,
      Country: loc.country,
      'Full Location': loc.fullLocation,
      Status: loc.isActive ? 'Active' : 'Inactive',
      'Created At': loc.createdAt.toISOString().split('T')[0]
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Locations');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // District
      { wch: 20 }, // City
      { wch: 20 }, // State
      { wch: 15 }, // Country
      { wch: 50 }, // Full Location
      { wch: 10 }, // Status
      { wch: 12 }  // Created At
    ];

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=locations_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting locations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/locations/sample-template
// @desc    Download sample Excel template
// @access  Private (Admin)
router.get('/sample-template', adminAuth, async (req, res) => {
  try {
    const sampleData = [
      { District: 'Loni', City: 'Ghaziabad', State: 'Uttar Pradesh', Country: 'India' },
      { District: 'Connaught Place', City: 'New Delhi', State: 'Delhi', Country: 'India' },
      { District: 'Andheri', City: 'Mumbai', State: 'Maharashtra', Country: 'India' },
      { District: 'Whitefield', City: 'Bangalore', State: 'Karnataka', Country: 'India' },
      { District: 'Salt Lake', City: 'Kolkata', State: 'West Bengal', Country: 'India' }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Locations');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // District
      { wch: 20 }, // City
      { wch: 20 }, // State
      { wch: 15 }  // Country
    ];

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=locations_sample_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating sample template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const JobEvent = require('../models/JobEvent');
const EventRegistration = require('../models/EventRegistration');

// Middleware - you'll need to adjust these based on your auth setup
// const { auth, adminAuth } = require('../middleware/auth');

// For now, using placeholder middleware - replace with your actual auth
const auth = (req, res, next) => {
  // Add your authentication logic here
  next();
};

const adminAuth = (req, res, next) => {
  // Add your admin authentication logic here
  next();
};

// ==================== PUBLIC ROUTES ====================

// Get all events (with filters) - Public with limited info
router.get('/public', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      state,
      eventType,
      search
    } = req.query;

    const query = { status: 'active' };
    
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (eventType) query.eventType = eventType;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { organizerName: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await JobEvent.find(query)
      .select('-createdBy -__v')
      .sort({ startDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await JobEvent.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single event - Public
router.get('/public/:id', async (req, res) => {
  try {
    const event = await JobEvent.findById(req.params.id)
      .select('-createdBy -__v');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Increment views
    await event.incrementViews();
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get upcoming events - Public
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await JobEvent.getUpcoming(parseInt(limit));
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get featured events - Public
router.get('/featured', async (req, res) => {
  try {
    const events = await JobEvent.getFeatured();
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register for event - Public
router.post('/:id/register', async (req, res) => {
  try {
    const event = await JobEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (event.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Event is not active for registration' });
    }
    
    if (!event.isRegistrationOpen) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }
    
    if (event.maxParticipants > 0 && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    
    const registration = new EventRegistration({
      eventId: req.params.id,
      ...req.body
    });
    
    await registration.save();
    
    // Update event participant count
    await event.incrementRegistrations();
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You will receive a confirmation email shortly.',
      data: registration
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    if (error.message.includes('already registered')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// Check if user is registered - Public
router.get('/:id/check-registration', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const registration = await EventRegistration.findOne({
      eventId: req.params.id,
      email: email.toLowerCase(),
      status: { $ne: 'cancelled' }
    });
    
    res.json({
      success: true,
      data: {
        isRegistered: !!registration,
        registration: registration || null
      }
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all events (with filters) - Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      organizerType,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (organizerType && organizerType !== 'all') {
      query.organizerType = organizerType;
    }
    
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { organizerName: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await JobEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email');

    const count = await JobEvent.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event statistics - Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const total = await JobEvent.countDocuments();
    const active = await JobEvent.countDocuments({ status: 'active' });
    const closed = await JobEvent.countDocuments({ status: 'closed' });
    const byCompanies = await JobEvent.countDocuments({ organizerType: 'company' });
    const byConsultancies = await JobEvent.countDocuments({ organizerType: 'consultancy' });
    
    const now = new Date();
    const upcoming = await JobEvent.countDocuments({
      startDate: { $gt: now },
      status: { $nin: ['cancelled', 'closed'] }
    });
    
    const ongoing = await JobEvent.countDocuments({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $nin: ['cancelled', 'closed'] }
    });
    
    const completed = await JobEvent.countDocuments({
      endDate: { $lt: now }
    });

    res.json({
      success: true,
      data: {
        total,
        upcoming,
        completed,
        ongoing,
        active,
        closed,
        byCompanies,
        byConsultancies
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single event - Admin
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const event = await JobEvent.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create event - Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Received event data:', req.body);
    
    const event = new JobEvent({
      ...req.body,
      createdBy: req.user?._id || null
    });
    
    await event.save();
    
    console.log('Event created successfully:', event._id);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Validation errors:', error.errors);
    
    // Send detailed validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event - Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const event = await JobEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete event - Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await JobEvent.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Delete all registrations for this event
    await EventRegistration.deleteMany({ eventId: req.params.id });
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update event status - Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'closed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const event = await JobEvent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({
      success: true,
      message: 'Event status updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get event registrations - Admin
router.get('/:id/registrations', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { eventId: req.params.id };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const registrations = await EventRegistration.find(query)
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');
    
    const count = await EventRegistration.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update registration status - Admin
router.put('/:eventId/registrations/:registrationId/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const registration = await EventRegistration.findOneAndUpdate(
      { _id: req.params.registrationId, eventId: req.params.eventId },
      { status },
      { new: true }
    );
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update registration - Admin
router.put('/:eventId/registrations/:registrationId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const registration = await EventRegistration.findOneAndUpdate(
      { _id: req.params.registrationId, eventId: req.params.eventId },
      { status },
      { new: true }
    );
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    
    res.json({
      success: true,
      message: 'Registration status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export registrations - Admin
router.get('/:id/export', adminAuth, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id })
      .sort({ registrationDate: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete registration - Admin
router.delete('/:eventId/registrations/:registrationId', adminAuth, async (req, res) => {
  try {
    const registration = await EventRegistration.findOneAndDelete({
      _id: req.params.registrationId,
      eventId: req.params.eventId
    });
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    // Decrement participant count
    await JobEvent.findByIdAndUpdate(req.params.eventId, {
      $inc: { currentParticipants: -1 }
    });
    
    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

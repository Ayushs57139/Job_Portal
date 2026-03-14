const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get suggested reply options
const SUGGESTED_REPLIES = {
  accept: "Thank you for connecting! I look forward to staying in touch.",
  accept_with_message: "Thanks for reaching out! I'd be happy to connect.",
  decline_politely: "Thank you for your interest, but I'm not accepting new connections at this time.",
  not_interested: "I appreciate the request, but I don't think we're a good fit for connection right now.",
  custom: ""
};

// Send connection request
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, message, connectionType } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send connection request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.checkConnection(req.user.id, recipientId);
    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Connection request already exists',
        status: existingConnection.status
      });
    }

    const connection = new Connection({
      requester: req.user.id,
      recipient: recipientId,
      message: message || '',
      connectionType: connectionType || 'professional',
      status: 'pending'
    });

    await connection.save();
    await connection.populate('requester', 'firstName lastName profile.avatar userType employerType');
    await connection.populate('recipient', 'firstName lastName profile.avatar userType employerType');

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get connection requests (received)
router.get('/requests/received', auth, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      recipient: req.user.id
    };

    if (status) {
      query.status = status;
    }

    const connections = await Connection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requester', 'firstName lastName profile.avatar userType employerType companyName consultancyName')
      .populate('recipient', 'firstName lastName profile.avatar userType employerType');

    const total = await Connection.countDocuments(query);

    res.json({
      connections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get connection requests (sent)
router.get('/requests/sent', auth, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      requester: req.user.id
    };

    if (status) {
      query.status = status;
    }

    const connections = await Connection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requester', 'firstName lastName profile.avatar userType employerType')
      .populate('recipient', 'firstName lastName profile.avatar userType employerType companyName consultancyName');

    const total = await Connection.countDocuments(query);

    res.json({
      connections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to connection request
router.post('/respond/:connectionId', auth, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { action, suggestedReply, replyMessage } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be accept or reject' });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ message: 'Connection request already responded to' });
    }

    connection.status = action === 'accept' ? 'accepted' : 'rejected';
    connection.respondedAt = new Date();
    
    if (suggestedReply) {
      connection.suggestedReply = suggestedReply;
      connection.replyMessage = SUGGESTED_REPLIES[suggestedReply] || replyMessage || '';
    } else if (replyMessage) {
      connection.suggestedReply = 'custom';
      connection.replyMessage = replyMessage;
    }

    await connection.save();
    await connection.populate('requester', 'firstName lastName profile.avatar userType employerType');
    await connection.populate('recipient', 'firstName lastName profile.avatar userType employerType');

    res.json({
      message: `Connection request ${action}ed successfully`,
      connection
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my connections
router.get('/my-connections', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    })
    .sort({ respondedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('requester', 'firstName lastName profile.avatar userType employerType companyName consultancyName')
    .populate('recipient', 'firstName lastName profile.avatar userType employerType companyName consultancyName');

    // Filter by search if provided
    let filteredConnections = connections;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredConnections = connections.filter(conn => {
        const otherUser = conn.requester._id.toString() === req.user.id ? conn.recipient : conn.requester;
        const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();
        const companyName = (otherUser.companyName || otherUser.consultancyName || '').toLowerCase();
        return fullName.includes(searchLower) || companyName.includes(searchLower);
      });
    }

    const total = await Connection.countDocuments({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    });

    res.json({
      connections: filteredConnections,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mutual connections
router.get('/mutual/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const mutualIds = await Connection.getMutualConnections(req.user.id, userId);
    
    const mutualUsers = await User.find({
      _id: { $in: mutualIds }
    }).select('firstName lastName profile.avatar userType employerType companyName consultancyName');

    res.json({
      count: mutualUsers.length,
      connections: mutualUsers
    });
  } catch (error) {
    console.error('Error fetching mutual connections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get suggested reply options
router.get('/suggested-replies', auth, async (req, res) => {
  try {
    res.json({
      replies: Object.keys(SUGGESTED_REPLIES).map(key => ({
        key,
        text: SUGGESTED_REPLIES[key]
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Block connection
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id }
      ]
    });

    if (connection) {
      connection.status = 'blocked';
      connection.blockedAt = new Date();
      connection.blockedBy = req.user.id;
      await connection.save();
    } else {
      // Create blocked connection
      const newConnection = new Connection({
        requester: req.user.id,
        recipient: userId,
        status: 'blocked',
        blockedAt: new Date(),
        blockedBy: req.user.id
      });
      await newConnection.save();
    }

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

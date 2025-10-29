const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');

// Get all conversations for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const employerType = req.user.employerType;

    let query = {
      'participants.user': userId,
      status: 'active'
    };

    // Filter conversations based on user type
    if (userType === 'jobseeker') {
      query.conversationType = { $in: ['jobseeker_employer', 'jobseeker_support'] };
    } else if (userType === 'employer') {
      if (employerType === 'company') {
        query.conversationType = { $in: ['jobseeker_employer', 'employer_support'] };
      } else if (employerType === 'consultancy') {
        query.conversationType = { $in: ['jobseeker_employer', 'employer_support'] };
      }
    } else if (userType === 'admin' || userType === 'superadmin') {
      query.conversationType = { $in: ['jobseeker_support', 'employer_support', 'admin_support'] };
    }

    const conversations = await Conversation.find(query)
      .populate('participants.user', 'firstName lastName profile.avatar userType employerType')
      .populate('lastMessage.sender', 'firstName lastName profile.avatar')
      .sort({ 'lastMessage.timestamp': -1 });

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => {
      const unreadCount = conv.unreadCount.get(userId.toString()) || 0;
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Check if user is participant in this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(p => p.user.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const messages = await Message.getConversationMessages(conversationId, parseInt(page), parseInt(limit));

    // Mark conversation as read for current user
    await conversation.markAsRead(userId);

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      conversation: conversation
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, replyTo } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user is participant in this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(p => p.user.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      replyTo: replyTo || null,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await message.save();

    // Increment unread count for other participants
    const otherParticipants = conversation.participants.filter(p => p.user.toString() !== userId.toString());
    for (const participant of otherParticipants) {
      await conversation.incrementUnread(participant.user);
    }

    // Populate sender information
    await message.populate('sender', 'firstName lastName profile.avatar userType employerType');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// Create a new conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participants, conversationType, subject, metadata } = req.body;
    const userId = req.user._id;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participants are required'
      });
    }

    // Add current user to participants if not already included
    const allParticipants = [...participants];
    const currentUserExists = allParticipants.some(p => p.user.toString() === userId.toString());
    if (!currentUserExists) {
      allParticipants.push({
        user: userId,
        userType: req.user.userType,
        employerType: req.user.employerType
      });
    }

    // Validate participants exist
    const participantIds = allParticipants.map(p => p.user);
    const users = await User.find({ _id: { $in: participantIds } });
    if (users.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants not found'
      });
    }

    // Create conversation
    const conversation = await Conversation.findOrCreateConversation(
      allParticipants,
      conversationType,
      { subject, metadata }
    );

    await conversation.populate('participants.user', 'firstName lastName profile.avatar userType employerType');

    res.status(201).json({
      success: true,
      conversation: conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
});

// Get available chat partners for the current user
router.get('/chat-partners', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const employerType = req.user.employerType;

    let query = { isActive: true };

    // Filter based on user type
    if (userType === 'jobseeker') {
      // Job seekers can chat with employers and support
      query.userType = { $in: ['employer', 'admin', 'superadmin'] };
    } else if (userType === 'employer') {
      // Employers can chat with job seekers and support
      query.userType = { $in: ['jobseeker', 'admin', 'superadmin'] };
    } else if (userType === 'admin' || userType === 'superadmin') {
      // Admins can chat with everyone
      query.userType = { $in: ['jobseeker', 'employer', 'admin', 'superadmin'] };
    }

    const users = await User.find(query)
      .select('firstName lastName profile.avatar userType employerType isActive')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching chat partners:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat partners'
    });
  }
});

// Mark conversation as read
router.put('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(p => p.user.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await conversation.markAsRead(userId);

    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking conversation as read'
    });
  }
});

// Get chat rooms for the current user
router.get('/rooms', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const employerType = req.user.employerType;

    const rooms = await ChatRoom.findRoomsForUser(userId, userType, employerType);

    res.json({
      success: true,
      rooms: rooms
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat rooms'
    });
  }
});

// Create a new chat room (admin only)
router.post('/rooms', auth, async (req, res) => {
  try {
    const { name, description, roomType, isPublic, settings, metadata } = req.body;
    const userId = req.user._id;

    // Only admins can create rooms
    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create chat rooms'
      });
    }

    const room = new ChatRoom({
      name,
      description,
      roomType,
      createdBy: userId,
      isPublic: isPublic || false,
      settings: settings || {},
      metadata: metadata || {}
    });

    // Add creator as admin
    await room.addParticipant(userId, 'admin');
    await room.save();

    await room.populate('createdBy', 'firstName lastName profile.avatar');

    res.status(201).json({
      success: true,
      room: room
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat room'
    });
  }
});

// Join a chat room
router.post('/rooms/:roomId/join', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Room is not active'
      });
    }

    await room.addParticipant(userId);
    await room.populate('participants.user', 'firstName lastName profile.avatar userType employerType');

    res.json({
      success: true,
      room: room
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining room'
    });
  }
});

// Leave a chat room
router.post('/rooms/:roomId/leave', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.removeParticipant(userId);

    res.json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving room'
    });
  }
});

module.exports = router;

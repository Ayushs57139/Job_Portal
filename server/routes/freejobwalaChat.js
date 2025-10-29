const express = require('express');
const router = express.Router();
const FreejobwalaChat = require('../models/FreejobwalaChat');
const User = require('../models/User');
const JobAlert = require('../models/JobAlert');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// @route   POST /api/freejobwala-chat/setup
// @desc    Setup Freejobwala Chat for user
// @access  Private
router.post('/setup', auth, async (req, res) => {
  try {
    const { mobile, whatsappNumber, email, chatPreferences } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!mobile || !whatsappNumber || !email) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number, WhatsApp number, and email are required'
      });
    }

    // Check if user already has Freejobwala Chat setup
    const existingChat = await FreejobwalaChat.findByUserId(userId);
    if (existingChat) {
      return res.status(400).json({
        success: false,
        message: 'Freejobwala Chat is already set up for this user'
      });
    }

    // Validate mobile and WhatsApp numbers
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile) || !mobileRegex.test(whatsappNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid 10-digit mobile and WhatsApp numbers'
      });
    }

    // Validate email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if mobile or WhatsApp number is already in use
    const existingMobile = await FreejobwalaChat.findByMobile(mobile);
    const existingWhatsApp = await FreejobwalaChat.findByWhatsApp(whatsappNumber);
    
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already registered with Freejobwala Chat'
      });
    }
    
    if (existingWhatsApp) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp number is already registered with Freejobwala Chat'
      });
    }

    // Create Freejobwala Chat setup
    const chatData = {
      userId: userId,
      mobile: mobile.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.toLowerCase().trim(),
      chatPreferences: chatPreferences || {
        jobUpdates: {
          enabled: true,
          frequency: 'daily',
          channels: {
            email: true,
            whatsapp: true,
            sms: false
          }
        },
        notifications: {
          newJobs: true,
          applicationUpdates: true,
          interviewReminders: true,
          jobRecommendations: true
        }
      }
    };

    const freejobwalaChat = new FreejobwalaChat(chatData);
    await freejobwalaChat.save();

    // Update user's phone and WhatsApp number if not already set
    await User.findByIdAndUpdate(userId, {
      phone: mobile.trim(),
      whatsappNumber: whatsappNumber.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Freejobwala Chat setup completed successfully',
      data: {
        id: freejobwalaChat._id,
        mobile: freejobwalaChat.formattedMobile,
        whatsappNumber: freejobwalaChat.formattedWhatsApp,
        email: freejobwalaChat.email,
        isVerified: freejobwalaChat.isVerified
      }
    });

  } catch (error) {
    console.error('Error setting up Freejobwala Chat:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while setting up Freejobwala Chat'
    });
  }
});

// @route   GET /api/freejobwala-chat/profile
// @desc    Get user's Freejobwala Chat profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatProfile = await FreejobwalaChat.findByUserId(userId);

    if (!chatProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freejobwala Chat not set up for this user'
      });
    }

    res.json({
      success: true,
      data: {
        id: chatProfile._id,
        mobile: chatProfile.formattedMobile,
        whatsappNumber: chatProfile.formattedWhatsApp,
        email: chatProfile.email,
        chatPreferences: chatProfile.chatPreferences,
        isVerified: chatProfile.isVerified,
        stats: chatProfile.stats,
        unreadCount: chatProfile.getUnreadCount()
      }
    });

  } catch (error) {
    console.error('Error fetching Freejobwala Chat profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat profile'
    });
  }
});

// @route   PUT /api/freejobwala-chat/preferences
// @desc    Update chat preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatPreferences } = req.body;

    const chatProfile = await FreejobwalaChat.findByUserId(userId);
    if (!chatProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freejobwala Chat not set up for this user'
      });
    }

    // Update preferences
    chatProfile.chatPreferences = {
      ...chatProfile.chatPreferences,
      ...chatPreferences
    };

    await chatProfile.save();

    res.json({
      success: true,
      message: 'Chat preferences updated successfully',
      data: {
        chatPreferences: chatProfile.chatPreferences
      }
    });

  } catch (error) {
    console.error('Error updating chat preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
});

// @route   GET /api/freejobwala-chat/messages
// @desc    Get chat messages history
// @access  Private
router.get('/messages', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chatProfile = await FreejobwalaChat.findByUserId(userId);
    if (!chatProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freejobwala Chat not set up for this user'
      });
    }

    // Get paginated messages
    const messages = chatProfile.chatHistory
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .slice(skip, skip + limit);

    const total = chatProfile.chatHistory.length;

    res.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @route   POST /api/freejobwala-chat/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.post('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const chatProfile = await FreejobwalaChat.findByUserId(userId);
    if (!chatProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freejobwala Chat not set up for this user'
      });
    }

    await chatProfile.markMessageAsRead(messageId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking message as read'
    });
  }
});

// @route   POST /api/freejobwala-chat/send-job-update
// @desc    Send job update notification (Admin only)
// @access  Admin only
router.post('/send-job-update', adminAuth, async (req, res) => {
  try {
    const { jobId, message, channels } = req.body;

    if (!jobId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Job ID and message are required'
      });
    }

    // Get job details
    const job = await Job.findById(jobId).populate('postedBy', 'firstName lastName');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get all active chat users
    const chatUsers = await FreejobwalaChat.findActiveUsers();
    
    let sentCount = 0;
    let failedCount = 0;

    // Send notifications to all active users
    for (const chatUser of chatUsers) {
      try {
        // Check if user wants job updates
        if (!chatUser.chatPreferences.jobUpdates.enabled || 
            !chatUser.chatPreferences.notifications.newJobs) {
          continue;
        }

        // Prepare message content
        const messageContent = `🎯 New Job Alert!\n\n${message}\n\nJob Title: ${job.title}\nCompany: ${job.postedBy.firstName} ${job.postedBy.lastName}\nLocation: ${job.location}\nSalary: ₹${job.salary}\n\nApply now: ${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs/${job._id}`;

        // Add to chat history
        await chatUser.addChatMessage({
          messageType: 'job_update',
          content: messageContent,
          jobId: jobId,
          sentVia: 'system',
          status: 'sent'
        });

        sentCount++;
      } catch (error) {
        console.error(`Error sending notification to user ${chatUser.userId}:`, error);
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: 'Job update notifications sent',
      data: {
        sent: sentCount,
        failed: failedCount,
        total: chatUsers.length
      }
    });

  } catch (error) {
    console.error('Error sending job update:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending job update'
    });
  }
});

// @route   GET /api/freejobwala-chat/stats
// @desc    Get Freejobwala Chat statistics (Admin only)
// @access  Admin only
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await FreejobwalaChat.countDocuments({ isActive: true });
    const verifiedUsers = await FreejobwalaChat.countDocuments({ isActive: true, isVerified: true });
    const activeUsers = await FreejobwalaChat.countDocuments({ 
      isActive: true, 
      'stats.lastActivity': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Get top users by message count
    const topUsers = await FreejobwalaChat.find({ isActive: true })
      .populate('userId', 'firstName lastName email')
      .sort({ 'stats.totalMessages': -1 })
      .limit(10)
      .select('userId stats.totalMessages stats.jobUpdatesSent stats.lastActivity');

    // Get message statistics
    const messageStats = await FreejobwalaChat.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$chatHistory' },
      {
        $group: {
          _id: '$chatHistory.messageType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        topUsers,
        messageStats
      }
    });

  } catch (error) {
    console.error('Error fetching Freejobwala Chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   DELETE /api/freejobwala-chat/deactivate
// @desc    Deactivate Freejobwala Chat for user
// @access  Private
router.delete('/deactivate', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const chatProfile = await FreejobwalaChat.findByUserId(userId);
    if (!chatProfile) {
      return res.status(404).json({
        success: false,
        message: 'Freejobwala Chat not set up for this user'
      });
    }

    chatProfile.isActive = false;
    await chatProfile.save();

    res.json({
      success: true,
      message: 'Freejobwala Chat deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating Freejobwala Chat:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating chat'
    });
  }
});

module.exports = router;
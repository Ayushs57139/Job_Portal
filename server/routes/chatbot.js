const express = require('express');
const router = express.Router();
const ChatbotConversation = require('../models/ChatbotConversation');
const ChatbotTemplate = require('../models/ChatbotTemplate');
const { v4: uuidv4 } = require('uuid');
const { auth, adminAuth } = require('../middleware/auth');

// Helper: decode JWT without throwing
function decodeToken(req) {
  try {
    const token = req.headers.authorization && req.headers.authorization.replace('Bearer ', '');
    if (!token) return null;
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (e) {
    return null;
  }
}

// Fetch dynamic data snippets for bot responses
async function fetchDynamicSnippet(type) {
  try {
    if (type === 'jobs') {
      const Job = require('../models/Job');
      const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 }).limit(3).select('title companyName location');
      if (!jobs.length) return null;
      return '🔥 Latest Jobs:\n' + jobs.map(function(j) {
        return '• ' + j.title + ' at ' + (j.companyName || 'Company') + ' — ' + (j.location || '');
      }).join('\n');
    }
    if (type === 'packages') {
      const Package = require('../models/Package');
      const pkgs = await Package.find({ isActive: true }).limit(3).select('name price');
      if (!pkgs.length) return null;
      return '📦 Our Packages:\n' + pkgs.map(function(p) {
        return '• ' + p.name + ' — ₹' + p.price;
      }).join('\n');
    }
    if (type === 'companies') {
      const Company = require('../models/Company');
      const companies = await Company.find({ isActive: true }).limit(3).select('name industry');
      if (!companies.length) return null;
      return '🏢 Top Companies Hiring:\n' + companies.map(function(c) {
        return '• ' + c.name + ' (' + (c.industry || 'Various') + ')';
      }).join('\n');
    }
  } catch (err) {
    console.error('Dynamic snippet error:', err);
  }
  return null;
}

// Static fallback responses when no template matches
function staticFallback(message, context, messageCount) {
  if (message.match(/\b(hi|hello|hey|namaste)\b/))
    return 'Hello! Welcome to Free Job Wala! 👋\n\nI can help you with:\n• Finding jobs\n• Application process\n• Resume tips\n• Company information\n\nHow can I assist you today?';
  if (message.match(/\b(job|jobs|vacancy|opening|search|find)\b/))
    return 'Great! 🎯 We have thousands of job openings.\n\n• Browse all jobs on our Jobs page\n• Filter by location, industry, or experience\n• Create job alerts for new openings\n\nWhat type of job are you looking for?';
  if (message.match(/\b(apply|application|how to apply)\b/))
    return 'Applying is easy! 📝\n\n1. Browse and select a job\n2. Click Apply Now\n3. Fill in your details\n4. Upload your resume\n5. Submit!\n\nTip: A complete profile improves your chances!';
  if (message.match(/\b(resume|cv|profile)\b/))
    return 'Your resume is key! 📄\n\nTips:\n• Keep it concise (1-2 pages)\n• Highlight achievements\n• Use action words\n• Include relevant skills\n\nUse our Resume Builder in your profile section!';
  if (message.match(/\b(alert|notification|notify)\b/))
    return 'Job alerts keep you updated! 🔔\n\n1. Go to Create Job Alert\n2. Set your preferences\n3. Choose frequency\n4. Get instant notifications!\n\nNever miss an opportunity!';
  if (message.match(/\b(package|price|cost|plan|subscription)\b/))
    return 'Job seeking is FREE! 🎉\n\n✅ Free registration\n✅ Free job applications\n✅ Free job alerts\n✅ Free profile creation\n\nEmployer packages are also available. Contact us for details!';
  if (message.match(/\b(contact|support|help|email|phone)\b/))
    return 'We are here to help! 📞\n\n• Email: support@freejobwala.com\n• Chat: Right here! (24/7)\n\nWhat do you need help with?';
  if (message.match(/\b(thank|thanks)\b/))
    return 'You are welcome! 😊 Is there anything else I can help you with?';
  if (message.match(/\b(bye|goodbye|see you)\b/))
    return 'Goodbye! 👋 Good luck with your job search! 🍀';
  if (messageCount > 10)
    return 'I appreciate your engagement! 🤖\n\nTo help you better, could you tell me:\n• What is your main goal?\n• What industry interests you?\n\nThis helps me give targeted assistance!';
  return 'I am here to help! 🤖\n\nI can assist with:\n• Job searching\n• Application process\n• Resume tips\n• Interview preparation\n• Profile completion\n\nFeel free to ask anything!';
}

// Dynamic bot response: DB templates first, then static fallback
async function generateBotResponse(userMessage, conversationContext, messageCount) {
  var msg = userMessage.toLowerCase().trim();

  // Try DB templates first (sorted by priority desc)
  try {
    var templates = await ChatbotTemplate.find({ isActive: true }).sort({ priority: -1 });
    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      var keywords = tpl.triggerKeywords || [];
      var matched = false;
      for (var k = 0; k < keywords.length; k++) {
        if (msg.indexOf(keywords[k]) !== -1) {
          matched = true;
          break;
        }
      }
      if (matched) {
        var response = tpl.responseText;
        if (tpl.attachDynamicData && tpl.attachDynamicData !== 'none') {
          var snippet = await fetchDynamicSnippet(tpl.attachDynamicData);
          if (snippet) response = response + '\n\n' + snippet;
        }
        return {
          text: response,
          suggestedReplies: tpl.suggestedReplies || [],
          templateId: tpl._id
        };
      }
    }
  } catch (err) {
    console.error('Template lookup error:', err);
  }

  // Fallback to static responses
  return {
    text: staticFallback(msg, conversationContext || '', messageCount || 0),
    suggestedReplies: []
  };
}

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// POST /api/chatbot/start
router.post('/start', async function(req, res) {
  try {
    var guestName = req.body.guestName;
    var guestEmail = req.body.guestEmail;
    var guestPhone = req.body.guestPhone;
    var userAgent = req.body.userAgent;
    var platform = req.body.platform;
    var decoded = decodeToken(req);
    var userId = decoded ? decoded.userId : null;

    var conversation = null;
    if (userId) {
      conversation = await ChatbotConversation.findOne({ userId: userId, status: 'active' }).sort({ lastActivity: -1 });
    }

    if (!conversation) {
      conversation = new ChatbotConversation({
        sessionId: uuidv4(),
        userId: userId || null,
        guestName: guestName || 'Guest',
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        userAgent: userAgent,
        platform: platform || 'web',
        ipAddress: req.ip || req.connection.remoteAddress,
        messages: []
      });
      await conversation.save();
    }

    res.status(201).json({ success: true, sessionId: conversation.sessionId, conversationId: conversation._id });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chatbot/message
router.post('/message', async function(req, res) {
  try {
    var sessionId = req.body.sessionId;
    var message = req.body.message;
    var sender = req.body.sender || 'user';

    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'Session ID and message are required' });
    }

    var conversation = await ChatbotConversation.findOne({ sessionId: sessionId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Link user if authenticated
    var decoded = decodeToken(req);
    if (decoded && decoded.userId && !conversation.userId) {
      conversation.userId = decoded.userId;
      await conversation.save();
    }

    await conversation.addMessage(sender, message);

    var recentMessages = conversation.messages.slice(-5).map(function(m) { return m.message; }).join(' ');
    var botResult = await generateBotResponse(message, recentMessages, conversation.messages.length);
    await conversation.addMessage('bot', botResult.text);

    // Emit to admin room via socket.io
    var io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('chatbot_new_message', {
        conversationId: conversation._id,
        sessionId: conversation.sessionId,
        guestName: conversation.guestName,
        userMessage: message,
        botResponse: botResult.text,
        timestamp: new Date()
      });
    }

    conversation = await ChatbotConversation.findOne({ sessionId: sessionId });

    res.json({
      success: true,
      messages: conversation.messages,
      botResponse: botResult.text,
      suggestedReplies: botResult.suggestedReplies || []
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chatbot/conversation/:sessionId
router.get('/conversation/:sessionId', async function(req, res) {
  try {
    var conversation = await ChatbotConversation.findOne({ sessionId: req.params.sessionId })
      .populate('userId', 'firstName lastName email');
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    var decoded = decodeToken(req);
    if (decoded && decoded.userId && !conversation.userId) {
      conversation.userId = decoded.userId;
      await conversation.save();
    }

    res.json({ success: true, conversation: conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chatbot/suggestions?type=jobs|packages|companies
router.get('/suggestions', async function(req, res) {
  try {
    var type = req.query.type || 'jobs';
    var snippet = await fetchDynamicSnippet(type);
    res.json({ success: true, snippet: snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── TEMPLATE ROUTES (Admin only) ────────────────────────────────────────────

// GET /api/chatbot/templates
router.get('/templates', adminAuth, async function(req, res) {
  try {
    var templates = await ChatbotTemplate.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, templates: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chatbot/templates
router.post('/templates', adminAuth, async function(req, res) {
  try {
    var body = req.body;
    if (!body.responseText) {
      return res.status(400).json({ success: false, message: 'responseText is required' });
    }

    var keywords = body.triggerKeywords;
    if (!Array.isArray(keywords)) {
      keywords = (keywords || '').split(',').map(function(k) { return k.trim(); }).filter(Boolean);
    }

    var replies = body.suggestedReplies;
    if (!Array.isArray(replies)) {
      replies = [];
    }

    var template = new ChatbotTemplate({
      triggerKeywords: keywords,
      responseText: body.responseText.trim(),
      category: body.category || 'general',
      suggestedReplies: replies,
      attachDynamicData: body.attachDynamicData || 'none',
      priority: parseInt(body.priority) || 0,
      isActive: body.isActive !== false,
      createdBy: req.user ? req.user._id : null
    });

    await template.save();
    res.status(201).json({ success: true, template: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/chatbot/templates/:id
router.put('/templates/:id', adminAuth, async function(req, res) {
  try {
    var body = req.body;
    var update = {
      responseText: body.responseText,
      category: body.category,
      attachDynamicData: body.attachDynamicData,
      priority: parseInt(body.priority) || 0,
      isActive: body.isActive !== false
    };

    if (body.triggerKeywords !== undefined) {
      update.triggerKeywords = Array.isArray(body.triggerKeywords)
        ? body.triggerKeywords
        : body.triggerKeywords.split(',').map(function(k) { return k.trim(); }).filter(Boolean);
    }

    if (body.suggestedReplies !== undefined) {
      update.suggestedReplies = Array.isArray(body.suggestedReplies) ? body.suggestedReplies : [];
    }

    var template = await ChatbotTemplate.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, template: template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/chatbot/templates/:id
router.delete('/templates/:id', adminAuth, async function(req, res) {
  try {
    await ChatbotTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── ADMIN SEND MESSAGE to user ───────────────────────────────────────────────

// POST /api/chatbot/admin/send
router.post('/admin/send', adminAuth, async function(req, res) {
  try {
    var sessionId = req.body.sessionId;
    var message = req.body.message;

    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'sessionId and message required' });
    }

    var conversation = await ChatbotConversation.findOne({ sessionId: sessionId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    await conversation.addMessage('bot', message);

    var io = req.app.get('io');
    if (io) {
      io.to('chatbot_' + sessionId).emit('chatbot_admin_message', {
        sessionId: sessionId,
        message: message,
        sender: 'bot',
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

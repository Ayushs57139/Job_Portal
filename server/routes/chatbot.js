const express = require('express');
const router = express.Router();
const ChatbotConversation = require('../models/ChatbotConversation');
const ChatbotTemplate = require('../models/ChatbotTemplate');
const { v4: uuidv4 } = require('uuid');
const { auth, adminAuth } = require('../middleware/auth');

// ─── Helper: decode JWT without throwing ────────────────────────────────────
function decodeToken(req) {
  try {
    con
    if (!token) return null;
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch { return null; }
}

// ─── Dynamic bot response (DB templates first, then fallback) ───────────────
async function generateBotResponse(userMessage, conversationContext = '', messageCount = 0, req = null) {
  const msg = userMessage.toLowerCase().trim();

  // 1. Try DB templates first (sorted by priority desc)
  try {
    const templates = await ChatbotTemplate.find({ isActive: true }).sort({ priority: -1 });
    for (const tpl of templates) {
    .triggerKeywords.some(kw => msg.includes(kw));
      if (matched) {
        let response = tpl.responseText;

        // Attach dynamic data if configured
        if (tpl.attachDynamicData && tpl.attachDynamicData !== 'none') {
          const dynamicSnippet = await fetchDynamicSnippet(tpl.attachDynamicData);
          if (dynamicSnippet) response += '\n\n' + dynamicSnippet;
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

  // 2. Fallback static responses
  return { text: staticFallback(msg, conversationContext, messageCount), suggestedReplies: [] };
}

async function fetchDynamicSnippet(type) {
  try {
    if (type === 'jobs') {
      const Job = require('../models/Job');
      const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 }).limit(3).select('title companyName location');
      if (!jobs.lengl;
      return '🔥 Latest Jobs:\n' + jobs.map(j => `• ${j.title} at ${j.companyName || 'Company'} — ${j.location || ''}`).join('\n');
    }
    if (type === 'packages') {
      const Package = require('../models/Package');
      const pkgs = await Package.find({ isActive: true }).limit(3).select('name price features');
      if (!pkgs.length) return null;
   kages:\n' + pkgs.map(p => `• ${p.name} — ₹${p.price}`).join('\n');
    }
    if (type === 'companies') {
      const Company = require('../models/Company');
      const companies = await Company.find({ isActive: true }).limit(3).select('name industry');
      if (!companies.length) return null;
      return '🏢 Top Companies Hiring:\n' + companies.map(c => `• ${c.name} (${c.industry || 'Various'})`).join('\n');
    }
  } catch (err) {
    console.error('Dynamic snippet error:', err);
  }
  return null;
}

function staticFallback(message, context, messageCount) {
  if (message.match(/\b(hi|hello|hey|namaste)\b/))
    return "Hello! Welcome to Free Job Wala! 👋\n\nI can help you with:\n• Finding jobs\n• Application process\n• Resume tips\n• Company information\n\nHow can I assist you today?";
  if (message.match(/\b(job|jobs|vacancy|opening|search|find)\b/))
    rw openings\n\nWhat type of job are you looking for?";
  if (message.match(/\b(apply|application|how to apply)\b/))
    return "Applying is easy! 📝\n\n1. Browse and select a job\n2. Click 'Apply Now'\n3. Fill in your details\n4. Upload your resume\n5. Submit!\n\nTip: A complete profile improves your chances!";
  if (message.match(/\b(resume|cv|profile)\b/))
    return "Your resume is key! 📄\n\nTips:\n• Keep it concise (1-2 pase our Resume Builder in your profile section!";
  if (message.match(/\b(alert|notification|notify)\b/))
    return "Job alerts keep you updated! 🔔\n\n1. Go to 'Create Job Alert'\n2. Set your preferences\n3. Choose frequency\n4. Get instant notifications!\n\nNever miss an opportunity!";
  if (message.match(/\b(package|price|cost|plan|subscription)\b/))
    return "Job seeking is FREE! 🎉\n\n✅ Freeavailable. Contact us for details!";
  if (message.match(/\b(contact|support|help|email|phone)\b/))
    return "We're here to help! 📞\n\n• Email: support@freejobwala.com\n• Chat: Right here! (24/7)\n\nWhat do you need help with?";
  if (message.match(/\b(thank|thanks)\b/))
    return "You're welcome! 😊 Is there anything else I can help you with?";
  if (message.match(/\b(bye|goodbye|see you)\b/))
    return "Goodbye! 👋 Good luck with your job search! 🍀";
  if (messageCount > 10)
    return "I appreciate your engagement! 🤖\n\nTo help you better, could you tell me:\n• What's your main goal?\n• What industry interests you?\n\nThis helps me give targeted assistance!";
  return "I'm here to help! 🤖\n\nI can assist with:\n• Job searching\n• Application process\n• Resume tips\n• Interview preparation\n• Profile completion\n\nFeel free to ask anything!";
}

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// POST /api/chatbot/start
router.post('/start', async (req, res) => {
  try {
    nst { guestName, guestEmail, guestPhone, userAgent, platform } = req.body;
    const decoded = decodeToken(req);
    const userId = decoded?.userId || null;

    let conversation = null;
    if (userId) {
      conversation = await ChatbotConversation.findOne({ userId, status: 'active' }).sort({ lastActivity: -1 });
    }

    if (!conversation) {
      conversation = new ChatbotConversation({
        sessionId: uuidv4(),
        userId,
        guestName: guestName || 'Guest',
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        userAgent,
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
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, sender = 'user' } = req.body;
    if (!sessionId || !message)
      return res.status(400).json({ success: false, message: 'Session ID and message are required' });

    let conversation = await ChatbotConversation.findOne({ sessionId });
    if (!conversation)
      return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Link user if authenticated
    const decoded = decodeToken(req);
    if (decoded?.userId && !conversation.userId) {
      conversation.userId = decoded.userId;
      await conversation.save();
    }

    await conversation.addMessage(sender, message);

    const context = conversation.messages.slice(-5).map(m => m.message).join(' ');
    const botResult = await generateBotResponse(message, context, conversation.messages.length, req);
    await conversation.addMessage('bot', botResult.text);

    // Emit to admin room via socket.io
    const io = req.app.get('io');
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

    conversation = await ChatbotConversation.findOne({ sessionId });

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
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const conversation = await ChatbotConversation.findOne({ sessionId: req.params.sessionId })
      .populate('userId', 'firstName lastName email');
    if (!conversation)
      return res.status(404).json({ success: false, message: 'Conversation not found' });

    const decoded = decodeToken(req);
    if (decoded?.userId && !conversation.userId) {
      conversation.userId = decoded.userId;
      await conversation.save();
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/chatbot/suggestions?type=jobs|packages|companies
router.get('/suggestions', async (req, res) => {
  try {
    const { type = 'jobs' } = req.query;
    const snippet = await fetchDynamicSnippet(type);
    res.json({ success: true, snippet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── TEMPLATE ROUTES (Admin) ─────────────────────────────────────────────────

// GET /api/chatbot/templates
router.get('/templates', adminAuth, async (req, res) => {
  try {
    const templates = await ChatbotTemplate.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/chatbot/templates
router.post('/templates', adminAuth, async (req, res) => {
  try {
    const { triggerKeywords, responseText, category, suggestedReplies, attachDynamicData, priority } = req.body;
    if (!responseText)
      return res.status(400).json({ success: false, message: 'responseText is required' });

    const temptTemplate({
      triggerKeywords: Array.isArray(triggerKeywords) ? triggerKeywords : (triggerKeywords || '').split(',').map(k => k.trim()).filter(Boolean),
      responseText,
      category: category || 'general',
      suggestedReplies: Array.isArray(suggestedReplies) ? suggestedReplies : [],
      attachDynamicData: attachDynamicData || 'none',
      priority: priority || 0,
      createdBy: req.user?._id
    });

    await template.save();
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/chatbot/templates/:id
router.put('/templates/:id', adminAuth, async (req, res) => {
  try {
    const { triggerKeywords, responseText, category, suggestedReplies, attachDynamicData, priority, isActive } = req.body;
    const update = {
      responseText,
      category,
      suggestedReplies: Array.isArray(suggestedReplies) ? suggestedReplies : [],
      attachDynamicData,
      priority,
      isActive
    };
    if (triggerKeywords !== undefined) {
      update.triggerKeywords = Array.isArray(triggerKeywords) ? triggerKeywords : triggerKeywords.split(',').map(k => k.trim()).filter(Boolean);
    }

    const template = await ChatbotTemplate.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/chatbot/templates/:id
router.delete('/templates/:id', adminAuth, async (req, res) => {
  try {
    await ChatbotTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
 {
      io.to(`chatbot_${sessionId}`).emit('chatbot_admin_message', {
        sessionId,
        message,
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
 res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message)
      return res.status(400).json({ success: false, message: 'sessionId and message required' });

    let conversation = await ChatbotConversation.findOne({ sessionId });
    if (!conversation)
      return res.status(404).json({ success: false, message: 'Conversation not found' });

    await conversation.addMessage('bot', message);

    // Emit to the specific session room
    const io = req.app.get('io');
    if (io)
// ─── ADMIN SEND MESSAGE to user ──────────────────────────────────────────────
// POST /api/chatbot/admin/send
router.post('/admin/send', adminAuth, async (req,
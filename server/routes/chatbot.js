const express = require('express');
const router = express.Router();
const ChatbotConversation = require('../models/ChatbotConversation');
const { v4: uuidv4 } = require('uuid');

// @route   POST /api/chatbot/start
// @desc    Start a new chatbot conversation
// @access  Public
router.post('/start', async (req, res) => {
  try {
    const { guestName, guestEmail, guestPhone, userAgent, platform } = req.body;
    
    const sessionId = uuidv4();
    
    const conversation = new ChatbotConversation({
      sessionId,
      guestName: guestName || 'Guest',
      guestEmail,
      guestPhone,
      userAgent,
      platform: platform || 'web',
      ipAddress: req.ip || req.connection.remoteAddress,
      messages: []
    });
    
    await conversation.save();
    
    res.status(201).json({
      success: true,
      sessionId,
      message: 'Conversation started'
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/chatbot/message
// @desc    Send a message in the conversation
// @access  Public
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, sender = 'user' } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ success: false, message: 'Session ID and message are required' });
    }
    
    let conversation = await ChatbotConversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    // Add user message
    await conversation.addMessage(sender, message);
    
    // Generate bot response
    const botResponse = generateBotResponse(message);
    await conversation.addMessage('bot', botResponse);
    
    // Reload conversation to get updated messages
    conversation = await ChatbotConversation.findOne({ sessionId });
    
    res.json({
      success: true,
      messages: conversation.messages,
      botResponse
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/chatbot/conversation/:sessionId
// @desc    Get conversation by session ID
// @access  Public
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const conversation = await ChatbotConversation.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Simple bot response generator
function generateBotResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Greetings
  if (message.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
    return "Hello! Welcome to Free Job Wala! 👋 How can I assist you today? I can help you with:\n\n• Finding jobs\n• Application process\n• Company information\n• Resume tips\n• Any other queries";
  }
  
  // Job related
  if (message.match(/\b(job|jobs|position|opening|vacancy|vacancies)\b/)) {
    return "Great! I can help you find jobs. 🎯\n\nWe have thousands of job openings across various sectors. You can:\n\n• Browse all jobs on our Jobs page\n• Filter by location, industry, or experience\n• Create job alerts for new openings\n• Apply directly through our platform\n\nWould you like me to guide you through the job search process?";
  }
  
  // Application related
  if (message.match(/\b(apply|application|how to apply)\b/)) {
    return "Applying for jobs is easy! 📝\n\nHere's how:\n\n1. Browse and select a job\n2. Click on 'Apply Now'\n3. Fill in your details\n4. Upload your resume\n5. Submit your application\n\nTip: Make sure your profile is complete for better chances!";
  }
  
  // Company related
  if (message.match(/\b(company|companies|employer|employers)\b/)) {
    return "We work with top companies and consultancies! 🏢\n\nYou can:\n\n• View company profiles\n• See active job postings\n• Check company reviews\n• Connect directly with recruiters\n\nAre you looking for a specific company or industry?";
  }
  
  // Resume/CV related
  if (message.match(/\b(resume|cv|curriculum vitae|profile)\b/)) {
    return "Your resume is very important! 📄\n\nTips for a great resume:\n\n• Keep it concise (1-2 pages)\n• Highlight key achievements\n• Use action words\n• Include relevant skills\n• Proofread for errors\n\nYou can also use our resume builder tool in your profile section!";
  }
  
  // Registration/Login
  if (message.match(/\b(register|signup|sign up|login|log in|account)\b/)) {
    return "Creating an account is quick and easy! 🔐\n\nBenefits of registration:\n\n• Save job searches\n• Apply with one click\n• Get personalized job recommendations\n• Track your applications\n• Access exclusive features\n\nClick on 'Register' or 'Login' at the top to get started!";
  }
  
  // Contact/Support
  if (message.match(/\b(contact|support|help|assistance|email|phone|call)\b/)) {
    return "We're here to help! 📞\n\nYou can reach us through:\n\n• Email: support@freejobwala.com\n• Phone: +91 1800-XXX-XXXX\n• Chat: Right here!\n• Social Media: @freejobwala\n\nOur support team is available 24/7 to assist you!";
  }
  
  // Pricing/Packages
  if (message.match(/\b(price|pricing|cost|fee|package|plan|subscription)\b/)) {
    return "Job seeking is FREE on our platform! 🎉\n\nFor Job Seekers:\n• Free registration\n• Free job applications\n• Free job alerts\n\nFor Employers:\n• Multiple packages available\n• Post unlimited jobs\n• Access to candidate database\n\nContact us for employer packages!";
  }
  
  // Thank you
  if (message.match(/\b(thank|thanks|appreciate)\b/)) {
    return "You're welcome! 😊 Is there anything else I can help you with today?";
  }
  
  // Goodbye
  if (message.match(/\b(bye|goodbye|see you|later)\b/)) {
    return "Goodbye! 👋 Thank you for chatting with us. Feel free to come back anytime if you need assistance. Good luck with your job search!";
  }
  
  // Default response
  return "Thank you for your message! 🤖\n\nI'm here to help you with:\n\n• Job search and applications\n• Company information\n• Resume tips\n• Platform navigation\n• General queries\n\nCould you please provide more details about what you're looking for? Or you can contact our support team for personalized assistance.";
}

module.exports = router;


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

// Enhanced dynamic bot response generator
function generateBotResponse(userMessage) {
  const message = userMessage.toLowerCase().trim();
  
  // Greetings
  if (message.match(/\b(hi|hello|hey|good morning|good afternoon|good evening|namaste|namaskar)\b/)) {
    const greetings = [
      "Hello! Welcome to Free Job Wala! 👋 How can I assist you today? I can help you with:\n\n• Finding jobs\n• Application process\n• Company information\n• Resume tips\n• Any other queries",
      "Hi there! 👋 Great to see you on Free Job Wala! I'm here to help you with your job search journey. What can I assist you with today?",
      "Hello! 👋 Welcome! I'm your job search assistant. I can help you find jobs, improve your resume, and guide you through the application process. How can I help?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Job search related
  if (message.match(/\b(job|jobs|position|opening|vacancy|vacancies|search|find|looking for|need job)\b/)) {
    const responses = [
      "Great! I can help you find jobs. 🎯\n\nWe have thousands of job openings across various sectors. You can:\n\n• Browse all jobs on our Jobs page\n• Filter by location, industry, or experience\n• Create job alerts for new openings\n• Apply directly through our platform\n\nWould you like me to guide you through the job search process?",
      "Excellent! 🎯 Finding the right job is important. Here's how you can search:\n\n• Use our advanced search filters\n• Browse by industry or location\n• Set up job alerts for instant notifications\n• Save jobs for later\n\nWhat type of job are you looking for?",
      "Perfect! 🎯 We have a wide range of job opportunities. You can:\n\n• Search by job title, skills, or keywords\n• Filter by salary, experience, or location\n• View detailed job descriptions\n• Apply with just one click\n\nTell me what kind of role you're interested in!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Application related
  if (message.match(/\b(apply|application|how to apply|submit|application process)\b/)) {
    const responses = [
      "Applying for jobs is easy! 📝\n\nHere's how:\n\n1. Browse and select a job\n2. Click on 'Apply Now'\n3. Fill in your details\n4. Upload your resume\n5. Submit your application\n\nTip: Make sure your profile is complete for better chances!",
      "Great question! 📝 Here's the simple application process:\n\n1. Find a job that matches your profile\n2. Click 'Apply Now' button\n3. Complete the application form\n4. Upload your updated resume\n5. Submit and track your application\n\nPro tip: Keep your profile updated to apply faster!",
      "Applying is straightforward! 📝\n\nSteps:\n1. Select a job posting\n2. Review job requirements\n3. Click 'Apply Now'\n4. Fill required information\n5. Upload resume and submit\n\nRemember: A complete profile increases your chances!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Resume/CV related
  if (message.match(/\b(resume|cv|curriculum vitae|profile|resume tips|improve resume)\b/)) {
    const responses = [
      "Your resume is very important! 📄\n\nTips for a great resume:\n\n• Keep it concise (1-2 pages)\n• Highlight key achievements\n• Use action words\n• Include relevant skills\n• Proofread for errors\n\nYou can also use our resume builder tool in your profile section!",
      "Resume tips! 📄 Here's what makes a standout resume:\n\n• Clear, professional format\n• Quantify your achievements\n• Tailor it to the job description\n• Include keywords from job postings\n• Keep it updated and error-free\n\nWant to know more about any specific aspect?",
      "Great question! 📄 A strong resume should:\n\n• Be well-organized and easy to read\n• Showcase your achievements with numbers\n• Match the job requirements\n• Include relevant skills and certifications\n• Be free of typos and grammatical errors\n\nNeed help with a specific section?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Job alerts
  if (message.match(/\b(job alert|alert|notification|notify|create alert|set alert)\b/)) {
    return "Job alerts are super helpful! 🔔\n\nCreate alerts to:\n\n• Get notified about new jobs matching your criteria\n• Never miss an opportunity\n• Save time on daily searches\n• Receive personalized recommendations\n\nTo create an alert:\n1. Go to 'Create Job Alert'\n2. Set your preferences (location, skills, etc.)\n3. Choose alert frequency\n4. Get instant notifications!\n\nWould you like help setting one up?";
  }
  
  // Company related
  if (message.match(/\b(company|companies|employer|employers|organization|org)\b/)) {
    return "We work with top companies and consultancies! 🏢\n\nYou can:\n\n• View company profiles\n• See active job postings\n• Check company reviews\n• Connect directly with recruiters\n• Learn about company culture\n\nAre you looking for a specific company or industry?";
  }
  
  // Profile related
  if (message.match(/\b(profile|update profile|edit profile|complete profile|profile help)\b/)) {
    return "Your profile is your professional identity! 👤\n\nTo create a complete profile:\n\n• Add your work experience\n• List your skills and certifications\n• Upload your resume\n• Add your education details\n• Include a professional summary\n\nA complete profile helps:\n• Get better job matches\n• Attract recruiters\n• Apply faster to jobs\n• Increase visibility\n\nNeed help updating any section?";
  }
  
  // Registration/Login
  if (message.match(/\b(register|signup|sign up|login|log in|account|create account|sign in)\b/)) {
    return "Creating an account is quick and easy! 🔐\n\nBenefits of registration:\n\n• Save job searches\n• Apply with one click\n• Get personalized job recommendations\n• Track your applications\n• Access exclusive features\n• Create multiple job alerts\n\nClick on 'Register' or 'Login' at the top to get started! It takes less than 2 minutes!";
  }
  
  // Contact/Support
  if (message.match(/\b(contact|support|help|assistance|email|phone|call|reach|get in touch)\b/)) {
    return "We're here to help! 📞\n\nYou can reach us through:\n\n• Email: support@freejobwala.com\n• Phone: +91 1800-XXX-XXXX\n• Chat: Right here! (Available 24/7)\n• Social Media: @freejobwala\n\nOur support team is available 24/7 to assist you with:\n• Account issues\n• Application problems\n• Technical support\n• General queries\n\nWhat do you need help with?";
  }
  
  // Pricing/Packages
  if (message.match(/\b(price|pricing|cost|fee|package|plan|subscription|free|paid)\b/)) {
    return "Job seeking is FREE on our platform! 🎉\n\nFor Job Seekers:\n• ✅ Free registration\n• ✅ Free job applications\n• ✅ Free job alerts\n• ✅ Free profile creation\n• ✅ Free resume upload\n\nFor Employers:\n• Multiple packages available\n• Post unlimited jobs\n• Access to candidate database\n• Featured job listings\n\nContact us for employer packages!";
  }
  
  // Interview related
  if (message.match(/\b(interview|preparation|prepare|interview tips|interview questions)\b/)) {
    return "Interview preparation is key! 💼\n\nHere are some tips:\n\n• Research the company thoroughly\n• Review the job description\n• Prepare common questions\n• Practice your answers\n• Prepare questions to ask\n• Dress professionally\n• Arrive on time\n• Follow up after the interview\n\nGood luck with your interviews! 🍀";
  }
  
  // Skills related
  if (message.match(/\b(skill|skills|learn|training|course|certification)\b/)) {
    return "Skills are essential! 🎓\n\nTo improve your skills:\n\n• Identify in-demand skills in your field\n• Take online courses\n• Get certifications\n• Practice regularly\n• Add skills to your profile\n• Highlight skills in your resume\n\nPopular skills employers look for:\n• Technical skills (varies by industry)\n• Communication skills\n• Problem-solving\n• Team collaboration\n• Leadership\n\nWhat skills are you looking to develop?";
  }
  
  // Thank you
  if (message.match(/\b(thank|thanks|appreciate|grateful|thankful)\b/)) {
    const thanks = [
      "You're welcome! 😊 Is there anything else I can help you with today?",
      "Happy to help! 😊 Feel free to ask if you need anything else. Good luck with your job search!",
      "My pleasure! 😊 Let me know if you have any other questions. Wishing you success!"
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  // Goodbye
  if (message.match(/\b(bye|goodbye|see you|later|farewell|good night)\b/)) {
    return "Goodbye! 👋 Thank you for chatting with us. Feel free to come back anytime if you need assistance. Good luck with your job search! 🍀";
  }
  
  // Questions about the platform
  if (message.match(/\b(what|how|when|where|why|can i|is it|does|do you)\b/)) {
    return "Great question! 🤔\n\nI can help you understand:\n\n• How to use our platform\n• Job search features\n• Application process\n• Profile setup\n• Job alerts\n• Company information\n\nCould you be more specific about what you'd like to know? I'm here to help!";
  }
  
  // Default response with suggestions
  const suggestions = [
    "I understand! 🤖\n\nI'm here to help you with:\n\n• Job search and applications\n• Company information\n• Resume tips and profile help\n• Job alerts setup\n• Platform navigation\n• Interview preparation\n\nCould you please provide more details about what you're looking for? Or try one of our quick actions!",
    "Thank you for your message! 🤖\n\nLet me help you better. I can assist with:\n\n• Finding the right jobs\n• Improving your resume\n• Setting up job alerts\n• Understanding the application process\n• Company research\n• Profile optimization\n\nWhat specific help do you need?",
    "I'm here to help! 🤖\n\nI can guide you on:\n\n• Job searching strategies\n• Application best practices\n• Resume writing tips\n• Interview preparation\n• Profile completion\n• Using platform features\n\nFeel free to ask me anything, or use the quick action buttons below!"
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

module.exports = router;


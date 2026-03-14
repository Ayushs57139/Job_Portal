const CommentSuggestion = require('../models/CommentSuggestion');

const defaultSuggestions = [
  // Jobseeker suggestions
  { userType: 'jobseeker', postType: 'job_announcement', suggestion: 'This looks like a great opportunity! I would love to apply.', category: 'interest' },
  { userType: 'jobseeker', postType: 'job_announcement', suggestion: 'Thank you for sharing this opportunity!', category: 'appreciation' },
  { userType: 'jobseeker', postType: 'job_announcement', suggestion: 'Is this position still available?', category: 'question' },
  { userType: 'jobseeker', postType: 'job_announcement', suggestion: 'What are the key requirements for this role?', category: 'question' },
  { userType: 'jobseeker', postType: 'job_announcement', suggestion: 'Congratulations on the new opening!', category: 'positive' },
  
  { userType: 'jobseeker', postType: 'career_tips', suggestion: 'This is really helpful, thank you!', category: 'appreciation' },
  { userType: 'jobseeker', postType: 'career_tips', suggestion: 'Great advice! I will definitely try this.', category: 'positive' },
  { userType: 'jobseeker', postType: 'career_tips', suggestion: 'Very insightful post!', category: 'appreciation' },
  
  { userType: 'jobseeker', postType: 'company_update', suggestion: 'Congratulations on this achievement!', category: 'positive' },
  { userType: 'jobseeker', postType: 'company_update', suggestion: 'Exciting news! Looking forward to more updates.', category: 'positive' },
  
  { userType: 'jobseeker', postType: 'all', suggestion: 'Thanks for sharing!', category: 'appreciation' },
  { userType: 'jobseeker', postType: 'all', suggestion: 'Very informative post.', category: 'professional' },
  { userType: 'jobseeker', postType: 'all', suggestion: 'Interesting perspective!', category: 'professional' },
  
  // Employer/Company suggestions
  { userType: 'company', postType: 'all', suggestion: 'Thank you for your interest!', category: 'professional' },
  { userType: 'company', postType: 'all', suggestion: 'We appreciate your engagement!', category: 'appreciation' },
  { userType: 'company', postType: 'all', suggestion: 'Great to see the positive response!', category: 'positive' },
  { userType: 'company', postType: 'all', suggestion: 'Feel free to reach out if you have any questions.', category: 'professional' },
  
  { userType: 'company', postType: 'job_announcement', suggestion: 'We look forward to receiving your application!', category: 'professional' },
  { userType: 'company', postType: 'job_announcement', suggestion: 'Please apply through our careers page for consideration.', category: 'professional' },
  
  // Consultancy suggestions
  { userType: 'consultancy', postType: 'all', suggestion: 'Thank you for your interest!', category: 'professional' },
  { userType: 'consultancy', postType: 'all', suggestion: 'We appreciate your engagement!', category: 'appreciation' },
  { userType: 'consultancy', postType: 'job_announcement', suggestion: 'Please share your updated resume for this opportunity.', category: 'professional' },
  { userType: 'consultancy', postType: 'job_announcement', suggestion: 'Contact us for more details about this position.', category: 'professional' },
  
  // Admin suggestions
  { userType: 'admin', postType: 'all', suggestion: 'Thank you for being part of our community!', category: 'appreciation' },
  { userType: 'admin', postType: 'all', suggestion: 'We appreciate your feedback!', category: 'appreciation' },
  { userType: 'admin', postType: 'all', suggestion: 'Great to see such engagement!', category: 'positive' },
  
  // Universal suggestions
  { userType: 'all', postType: 'all', suggestion: 'Congratulations!', category: 'positive' },
  { userType: 'all', postType: 'all', suggestion: 'Well done!', category: 'positive' },
  { userType: 'all', postType: 'all', suggestion: 'Amazing!', category: 'positive' },
  { userType: 'all', postType: 'all', suggestion: 'Thank you for sharing!', category: 'appreciation' },
  { userType: 'all', postType: 'all', suggestion: 'Very helpful!', category: 'appreciation' },
  { userType: 'all', postType: 'all', suggestion: 'Interesting!', category: 'professional' },
  { userType: 'all', postType: 'all', suggestion: 'Great post!', category: 'positive' },
];

async function seedCommentSuggestions() {
  try {
    console.log('Seeding comment suggestions...');
    
    // Clear existing suggestions
    await CommentSuggestion.deleteMany({});
    console.log('Cleared existing suggestions');
    
    // Insert new suggestions
    await CommentSuggestion.insertMany(defaultSuggestions);
    console.log(`Inserted ${defaultSuggestions.length} comment suggestions`);
    
    console.log('Comment suggestions seeded successfully!');
  } catch (error) {
    console.error('Error seeding comment suggestions:', error);
    throw error;
  }
}

module.exports = { seedCommentSuggestions };

// Run if called directly
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedCommentSuggestions();
    process.exit(0);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}

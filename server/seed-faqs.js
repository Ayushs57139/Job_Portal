const mongoose = require('mongoose');
require('dotenv').config();

const FAQ = require('./models/FAQ');

const dummyFAQs = [
  // General
  { question: 'What is FreeJobWala?', answer: 'FreeJobWala is a free job portal connecting job seekers with top employers across India. We provide free job listings, resume building tools, and career resources.', category: 'General', order: 1, isActive: true, isFeatured: true },
  { question: 'Is FreeJobWala completely free to use?', answer: 'Yes! FreeJobWala is 100% free for job seekers. You can browse jobs, apply, and use all career tools without any charges.', category: 'General', order: 2, isActive: true, isFeatured: true },
  { question: 'How do I create an account?', answer: 'Click the "Register" button on the homepage, fill in your basic details, verify your email, and you\'re ready to start applying for jobs.', category: 'General', order: 3, isActive: true, isFeatured: false },

  // Job Seekers
  { question: 'How do I apply for a job?', answer: 'Browse jobs using the search bar or filters, click on a job listing, review the details, and hit "Apply Now". Make sure your profile is complete for better chances.', category: 'Job Seekers', order: 1, isActive: true, isFeatured: true },
  { question: 'Can I apply to multiple jobs at once?', answer: 'Yes, you can apply to as many jobs as you like. We recommend tailoring your application for each role to improve your success rate.', category: 'Job Seekers', order: 2, isActive: true, isFeatured: false },
  { question: 'How do I track my job applications?', answer: 'Go to your dashboard and click on "My Applications". You\'ll see the status of each application — Applied, Under Review, Shortlisted, or Rejected.', category: 'Job Seekers', order: 3, isActive: true, isFeatured: false },
  { question: 'What should I include in my profile?', answer: 'Add your work experience, education, skills, certifications, and a professional photo. A complete profile gets 3x more views from employers.', category: 'Job Seekers', order: 4, isActive: true, isFeatured: false },

  // Employers
  { question: 'How do I post a job on FreeJobWala?', answer: 'Register as an employer, go to your dashboard, click "Post a Job", fill in the job details, and publish. Your listing goes live immediately after review.', category: 'Employers', order: 1, isActive: true, isFeatured: false },
  { question: 'How many jobs can I post for free?', answer: 'Free accounts can post up to 3 active job listings. Upgrade to a premium plan for unlimited postings and advanced candidate filtering.', category: 'Employers', order: 2, isActive: true, isFeatured: false },
  { question: 'How do I manage applications received?', answer: 'From your employer dashboard, go to "Applications". You can filter, shortlist, message candidates, and update application statuses all in one place.', category: 'Employers', order: 3, isActive: true, isFeatured: false },

  // Technical
  { question: 'I forgot my password. How do I reset it?', answer: 'Click "Forgot Password" on the login page, enter your registered email, and we\'ll send you a reset link within a few minutes. Check your spam folder if you don\'t see it.', category: 'Technical', order: 1, isActive: true, isFeatured: false },
  { question: 'Is my personal data safe on FreeJobWala?', answer: 'Absolutely. We use industry-standard encryption and never sell your data to third parties. You can control your privacy settings from your account page.', category: 'Technical', order: 2, isActive: true, isFeatured: false },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await FAQ.countDocuments();
    if (existing > 0) {
      console.log(`${existing} FAQs already exist. Skipping seed to avoid duplicates.`);
      console.log('To re-seed, run: node seed-faqs.js --force');
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await FAQ.deleteMany({});
      console.log('Cleared existing FAQs');
    }

    const inserted = await FAQ.insertMany(dummyFAQs);
    console.log(`✅ Seeded ${inserted.length} FAQs successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();

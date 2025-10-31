const mongoose = require('mongoose');
const SocialUpdate = require('./models/SocialUpdate');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const socialUpdates = [
  {
    title: '🚀 Exciting Job Opportunities in Tech Industry!',
    content: `We're thrilled to announce 50+ new job openings in the technology sector across various cities in India! Whether you're a fresher looking to start your career or an experienced professional seeking new challenges, we have opportunities for everyone.

Key highlights:
✅ Work from Home options available
✅ Competitive salary packages
✅ Growth-oriented environment
✅ Learning & development programs

Popular roles:
• Software Developer / Engineer
• Full Stack Developer
• Data Scientist
• Business Analyst
• Project Manager

Apply now and take the next step in your career journey! 🎯

#JobOpportunities #TechJobs #CareerGrowth #JobsForFreshers`,
    postType: 'job_announcement',
    category: 'Technology',
    tags: ['Tech Jobs', 'Software Engineering', 'Career Opportunities', 'IT Jobs'],
    engagement: {
      likes: 156,
      shares: 42,
      comments: 28,
      views: 1245,
      clicks: 389
    },
    isFeatured: true,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '💡 Industry Update: Remote Work Trends 2024',
    content: `The workplace landscape continues to evolve! 📊 According to recent industry reports, remote work adoption has increased by 340% since 2020.

Key findings:
🔹 73% of employees prefer hybrid work models
🔹 Companies see 20-30% productivity improvement with flexible arrangements
🔹 Work-life balance is the #1 priority for job seekers
🔹 Cities are investing in digital infrastructure

What this means for job seekers:
• More opportunities to work for global companies
• Increased focus on results over hours worked
• Emphasis on digital collaboration skills
• Better work-life integration

Stay ahead of the curve by developing remote collaboration skills!

#RemoteWork #WorkplaceTrends #FutureOfWork #CareerTips`,
    postType: 'industry_news',
    category: 'Trends',
    tags: ['Remote Work', 'Industry Trends', 'Work-Life Balance', 'Future of Work'],
    engagement: {
      likes: 234,
      shares: 67,
      comments: 45,
      views: 2100,
      clicks: 523
    },
    isFeatured: true,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '🎓 Tips for Acing Your Next Interview',
    content: `Interview season is here! Here are proven tips to help you stand out: 📝

✨ Do Your Homework
• Research the company thoroughly
• Understand their values and mission
• Learn about recent news and projects

✨ Prepare Your Stories
• Use the STAR method (Situation, Task, Action, Result)
• Prepare 3-5 success stories highlighting different skills
• Practice your delivery

✨ Ask Thoughtful Questions
• "What does success look like in this role?"
• "How does the team collaborate?"
• "What opportunities are there for growth?"

✨ Follow Up
• Send a thank-you email within 24 hours
• Mention specific points from your conversation
• Reiterate your interest

✨ Confidence is Key
• Maintain eye contact
• Dress appropriately
• Be authentic and genuine

Remember: Every interview is a learning experience. Even if you don't get this job, you're building skills for the next one! 💪

Good luck! 🌟

#InterviewTips #CareerAdvice #JobSearch #CareerGrowth`,
    postType: 'career_tips',
    category: 'Career Development',
    tags: ['Interview Tips', 'Career Advice', 'Job Search', 'Professional Development'],
    engagement: {
      likes: 189,
      shares: 54,
      comments: 32,
      views: 1650,
      clicks: 412
    },
    isFeatured: false,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '🎉 Welcoming 100+ New Companies to Our Platform!',
    content: `We're excited to announce that over 100 new companies have joined our platform this month! 🎊

This expansion brings:
🏢 Diverse opportunities across 15+ industries
🌍 Locations spanning 40+ cities in India
💼 Entry-level to senior positions
📈 Growth-focused organizations

Featured industries:
• Information Technology
• Finance & Banking
• Healthcare
• E-commerce & Retail
• Manufacturing
• Sales & Marketing

Whether you're a recent graduate or an experienced professional, our growing network means more opportunities for you!

Explore open positions now and find your perfect match. 🎯

#NewOpportunities #JobSearch #CareerGrowth #HiringTrends`,
    postType: 'company_update',
    category: 'Platform Updates',
    tags: ['Platform Growth', 'New Companies', 'Job Opportunities', 'Career Updates'],
    engagement: {
      likes: 142,
      shares: 38,
      comments: 21,
      views: 980,
      clicks: 345
    },
    isFeatured: false,
    isPinned: true,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '📢 Save the Date: Virtual Career Fair 2024',
    content: `Join us for the biggest virtual career fair of the year! 📅

🗓️ Date: March 15-17, 2024
⏰ Time: 10:00 AM - 6:00 PM IST
💻 Platform: Virtual (Link to be shared)

What to expect:
🎯 200+ companies hiring
💼 5000+ job openings
🎓 Career counseling sessions
📚 Skill development workshops
🤝 Networking opportunities

Featured sessions:
• "How to Build Your Personal Brand"
• "Salary Negotiation Masterclass"
• "LinkedIn Optimization Workshop"
• "Interview Preparation Bootcamp"

Registration opens soon! Follow us for updates and secure your spot early.

Don't miss this chance to connect with top employers and advance your career! 🚀

Register now: Link in bio

#CareerFair #VirtualEvent #JobFair #Networking #CareerGrowth`,
    postType: 'event_announcement',
    category: 'Events',
    tags: ['Career Fair', 'Virtual Event', 'Networking', 'Job Opportunities'],
    engagement: {
      likes: 278,
      shares: 89,
      comments: 56,
      views: 3200,
      clicks: 756
    },
    isFeatured: true,
    isPinned: true,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '💼 Success Story: From Intern to Director',
    content: `Meet Priya Sharma, who started as an intern and is now a Director at a leading tech company! 🌟

Her journey:
👉 2020: Started as Software Engineering Intern
👉 2021: Promoted to Jr. Developer
👉 2022: Became Senior Developer
👉 2023: Lead Developer role
👉 2024: Director of Engineering

Her advice for job seekers:
✅ "Never stop learning - technology evolves daily"
✅ "Take on challenging projects that stretch your skills"
✅ "Build strong relationships - your network matters"
✅ "Ask for feedback and act on it"
✅ "Be patient but persistent"

Key takeaway: Career growth is a marathon, not a sprint. Focus on continuous improvement, building relationships, and delivering value.

What's your career goal? Share in the comments! 👇

#SuccessStory #CareerGrowth #Motivation #Inspiration #CareerGoals`,
    postType: 'career_tips',
    category: 'Inspiration',
    tags: ['Success Story', 'Career Growth', 'Motivation', 'Professional Development'],
    engagement: {
      likes: 445,
      shares: 128,
      comments: 89,
      views: 4500,
      clicks: 892
    },
    isFeatured: true,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '🎯 Quick Tips: Building Your LinkedIn Profile',
    content: `Your LinkedIn profile is your online professional identity. Make it work for you! 📱

Profile Optimization Checklist:
✅ Professional headshot (good lighting, professional attire)
✅ Compelling headline (120 characters, keyword-rich)
✅ Summary that tells your story (3-4 paragraphs)
✅ Detailed experience with accomplishments
✅ Skills endorsed by colleagues
✅ Recommendations from managers/colleagues
✅ Recent activity and engagement

Pro Tips:
🔹 Add media to showcase your work
🔹 Customize your LinkedIn URL
🔹 Use relevant keywords for your industry
🔹 Post regularly to increase visibility
🔹 Engage with your network's content
🔹 Join relevant groups
🔹 Keep your profile updated

Invest time in your LinkedIn profile - it's often the first impression employers get of you. 💼

What's one thing you've done recently to improve your LinkedIn profile? Share below! 👇

#LinkedInTips #ProfessionalBranding #CareerAdvice #Networking`,
    postType: 'career_tips',
    category: 'Professional Development',
    tags: ['LinkedIn', 'Professional Branding', 'Career Advice', 'Networking'],
    engagement: {
      likes: 167,
      shares: 43,
      comments: 28,
      views: 1430,
      clicks: 389
    },
    isFeatured: false,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '🌟 Hiring: Data Scientists & Analysts Needed',
    content: `We're actively hiring Data Scientists and Business Analysts! 📊

Positions Available:
• Senior Data Scientist (3+ years)
• Jr. Data Analyst (0-2 years)
• Business Analyst (1-4 years)
• Data Engineer (2+ years)

What we offer:
💰 Attractive salary packages
🏠 Flexible work arrangements
📚 Learning & certification support
🎯 Career growth opportunities
🏥 Comprehensive health benefits

Requirements:
• Strong analytical skills
• Proficiency in Python/SQL
• Experience with data visualization tools
• Excellent communication skills
• Problem-solving mindset

Fast-track application process:
1️⃣ Update your profile
2️⃣ Upload your resume
3️⃣ Apply in 2 clicks

Join a team that's shaping the future with data-driven insights! 🚀

Apply now or share with someone looking for opportunities!

#DataScience #AnalyticsJobs #DataAnalyst #TechCareers #NowHiring`,
    postType: 'job_announcement',
    category: 'Technology',
    tags: ['Data Science', 'Data Analyst', 'Tech Jobs', 'Now Hiring'],
    engagement: {
      likes: 198,
      shares: 51,
      comments: 34,
      views: 1780,
      clicks: 567
    },
    isFeatured: false,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '📚 Professional Development: Free Courses Available',
    content: `Invest in your future with our curated list of FREE professional development courses! 🎓

Featured Courses:
1️⃣ Digital Marketing Fundamentals (Google)
2️⃣ Introduction to Data Science (IBM)
3️⃣ Project Management Basics (Google)
4️⃣ Python for Everyone (University of Michigan)
5️⃣ Excel Skills for Business (Macquarie University)
6️⃣ Introduction to HTML/CSS (Codecademy)
7️⃣ Business Communication (University of Washington)
8️⃣ Leadership & Management (Northwestern University)

Why continuous learning matters:
• Stay competitive in the job market
• Discover new career paths
• Increase your earning potential
• Build confidence
• Network with like-minded professionals

Time investment: Most courses are self-paced and take 4-8 hours to complete.

Certificate benefit: Many courses offer verified certificates for a small fee - great for your resume!

Start your learning journey today! 📖

Which course interests you most? Let us know in the comments! 👇

#FreeEducation #ProfessionalDevelopment #CareerGrowth #OnlineLearning #SkillBuilding`,
    postType: 'career_tips',
    category: 'Education',
    tags: ['Online Learning', 'Professional Development', 'Free Courses', 'Skill Building'],
    engagement: {
      likes: 312,
      shares: 94,
      comments: 67,
      views: 2600,
      clicks: 723
    },
    isFeatured: true,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  },
  {
    title: '🔥 Industry Spotlight: AI & Machine Learning Jobs',
    content: `The AI revolution is creating unprecedented job opportunities! 🤖

Why AI/ML careers are booming:
📈 Market growth: 38% annual increase
💰 Salary range: ₹8-50 Lakhs+ for experienced professionals
🌍 Global demand with remote opportunities
🚀 Cutting-edge technology that shapes the future

Top AI/ML Roles in Demand:
• Machine Learning Engineer
• AI Research Scientist
• Data Scientist
• AI Product Manager
• ML Operations Engineer
• Computer Vision Engineer

Skills to Master:
• Python programming
• Machine Learning frameworks (TensorFlow, PyTorch)
• Data manipulation and analysis
• Statistical modeling
• Cloud platforms (AWS, Azure, GCP)

Entry Requirements:
• Computer Science or related degree
• Strong mathematical foundation
• Programming proficiency
• Problem-solving skills

Ready to launch your AI career?

Apply to open positions or start with online courses to build your skills! 💪

The future is AI - are you ready to be part of it? 🌟

#AIJobs #MachineLearning #TechCareers #FutureTech #CareerOpportunities`,
    postType: 'industry_news',
    category: 'Technology',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Tech Careers', 'Future Skills'],
    engagement: {
      likes: 423,
      shares: 145,
      comments: 78,
      views: 4800,
      clicks: 1024
    },
    isFeatured: true,
    isPinned: false,
    visibility: 'public',
    status: 'published'
  }
];

async function seedSocialUpdates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to use as author
    const adminUser = await User.findOne({ 
      userType: { $in: ['admin', 'superadmin'] } 
    });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Seeding social updates...');
    
    for (const update of socialUpdates) {
      // Check if update already exists
      const existing = await SocialUpdate.findOne({ 
        title: update.title,
        'author': adminUser._id
      });
      
      if (!existing) {
        await SocialUpdate.create({
          ...update,
          author: adminUser._id,
          authorType: 'admin',
          authorName: adminUser.firstName + ' ' + (adminUser.lastName || ''),
          authorLogo: ''
        });
      } else {
        console.log(`Social update "${update.title}" already exists, skipping...`);
      }
    }

    console.log('✅ Successfully seeded social updates');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding social updates:', error);
    process.exit(1);
  }
}

seedSocialUpdates();


const mongoose = require('mongoose');
const Blog = require('./models/Blog');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

const blogs = [
  {
    title: 'How to Write a Winning Resume in 2024',
    excerpt: 'Learn the latest resume writing tips and tricks to stand out from the competition. Discover what employers are looking for in 2024.',
    content: `A winning resume is your ticket to landing your dream job. In today's competitive job market, having a well-crafted resume can make all the difference. Here are the essential tips:

1. **Start with a Strong Summary**: Your professional summary should be concise, powerful, and tailored to the job you're applying for. Highlight your key achievements and what makes you unique.

2. **Quantify Your Achievements**: Numbers speak louder than words. Instead of saying "increased sales," say "increased sales by 30% in 6 months."

3. **Tailor for Each Application**: Generic resumes don't cut it anymore. Customize your resume for each job by highlighting relevant skills and experiences.

4. **Keep It Concise**: Aim for one page if you're early in your career, and maximum two pages if you're experienced. Hiring managers spend seconds scanning resumes.

5. **Use Action Verbs**: Start bullet points with action verbs like "achieved," "managed," "developed," "implemented" to show impact.

6. **Proofread Carefully**: Typos and grammatical errors can instantly disqualify you. Have someone else review your resume before submitting.

7. **Include Relevant Keywords**: Many companies use ATS (Applicant Tracking Systems) that scan for keywords from the job description.

8. **Professional Formatting**: Keep the design clean, use consistent fonts, and ensure proper spacing. Your resume should be easy to scan.

Remember, your resume is your marketing document. It should showcase your value proposition and make employers want to interview you.`,
    category: 'Resume Writing',
    author: 'Career Expert',
    authorType: 'admin',
    image: '📝',
    readTime: '5 min read',
    tags: ['Resume', 'Career Tips', 'Job Search'],
    featured: true,
    published: true,
    views: 2450,
    likes: 180,
    seoTitle: 'How to Write a Winning Resume in 2024 - Career Tips',
    seoDescription: 'Essential resume writing tips for 2024. Learn how to create a standout resume that gets you noticed by employers.'
  },
  {
    title: 'Top 10 Interview Questions and How to Answer Them',
    excerpt: 'Master the most common interview questions and discover proven strategies to ace your next job interview.',
    content: `Interviews can be nerve-wracking, but with proper preparation, you can confidently tackle any question. Here are the top 10 interview questions and how to answer them:

1. **"Tell me about yourself"**: Keep it professional and relevant. Provide a 2-minute summary of your background, highlighting experiences that relate to the job.

2. **"Why do you want this job?"**: Show genuine interest in the role and company. Research the company and connect your skills to their needs.

3. **"What are your strengths?"**: Choose strengths relevant to the job. Provide specific examples of how you've demonstrated these strengths.

4. **"What are your weaknesses?"**: Be honest but strategic. Pick a real weakness and show how you're working to improve it.

5. **"Where do you see yourself in 5 years?"**: Show ambition but also commitment. Demonstrate how the role fits into your career plan.

6. **"Why should we hire you?"**: This is your chance to sell yourself. Highlight unique qualities and experiences that make you the best fit.

7. **"How do you handle stress?"**: Provide concrete examples of stressful situations you've navigated successfully.

8. **"What's your salary expectation?"**: Research market rates beforehand. Provide a range based on your experience and the job requirements.

9. **"Do you have any questions?"**: Always have questions prepared. This shows interest and helps you evaluate if the role is right for you.

10. **"Tell me about a challenge you faced"**: Use the STAR method (Situation, Task, Action, Result) to structure your answer.

Remember: Prepare stories for common behavioral questions, practice your answers aloud, and always be authentic. Confidence and preparation are your best tools.`,
    category: 'Interview Prep',
    author: 'HR Specialist',
    authorType: 'admin',
    image: '💼',
    readTime: '7 min read',
    tags: ['Interview', 'Career Advice', 'Job Search'],
    featured: true,
    published: true,
    views: 3200,
    likes: 210,
    seoTitle: 'Top 10 Interview Questions and Winning Answers',
    seoDescription: 'Master the art of interviews. Learn how to answer the most common interview questions with confidence.'
  },
  {
    title: 'Remote Work: The Future of Employment',
    excerpt: 'Explore the rise of remote work and how it\'s transforming the modern workplace landscape.',
    content: `Remote work has become a permanent fixture in the employment landscape. The COVID-19 pandemic accelerated a trend that was already underway, and now, remote work is here to stay. Here's what you need to know:

**The Growth of Remote Work**

Before 2020, remote work was a perk for a select few. Today, it's become the norm for millions of workers globally. Companies have discovered that remote work offers numerous benefits:

1. **Increased Productivity**: Contrary to initial concerns, studies show that remote workers are often more productive.

2. **Cost Savings**: Both employers and employees save money on commuting, office space, and related expenses.

3. **Better Work-Life Balance**: Remote work allows for more flexible schedules and eliminates commute time.

4. **Access to Global Talent**: Companies can hire the best talent regardless of location.

**Skills Needed for Remote Work Success**

To thrive in remote work, focus on these skills:

- **Time Management**: Be disciplined about your work hours
- **Communication**: Over-communicate to stay connected with your team
- **Tech Savviness**: Comfort with collaboration tools
- **Self-Motivation**: Ability to work independently
- **Boundary Setting**: Know when to log off

**Challenges to Overcome**

Remote work isn't without its challenges:

- Loneliness and isolation
- Difficulty separating work from home life
- Potential for overwork
- Technology issues
- Reduced visibility for promotions

**Tips for Remote Work Success**

1. Create a dedicated workspace
2. Establish a routine
3. Take regular breaks
4. Stay connected with colleagues
5. Set clear boundaries
6. Invest in good equipment
7. Prioritize your mental health

**The Future**

Hybrid models are becoming the most popular option, combining the flexibility of remote work with the benefits of in-office collaboration. As the workplace continues to evolve, adaptability will be key to your career success.`,
    category: 'Workplace Trends',
    author: 'Workplace Analyst',
    authorType: 'admin',
    image: '🏠',
    readTime: '8 min read',
    tags: ['Remote Work', 'Trends', 'Work-Life Balance'],
    featured: true,
    published: true,
    views: 4100,
    likes: 285,
    seoTitle: 'Remote Work: The Future of Employment and How to Succeed',
    seoDescription: 'Everything you need to know about remote work trends, benefits, challenges, and success strategies.'
  },
  {
    title: 'Networking Strategies for Career Growth',
    excerpt: 'Master the art of professional networking and unlock opportunities for career advancement.',
    content: `Networking is one of the most powerful tools for career advancement. Building meaningful professional relationships can open doors to opportunities you never knew existed. Here's how to network effectively:

**Why Networking Matters**

Studies show that 85% of jobs are filled through networking. Your network is your net worth in the professional world. Here's how to build it strategically:

**Building Your Network**

1. **Attend Industry Events**: Conferences, workshops, and seminars are networking goldmines.

2. **Join Professional Groups**: Both online and offline groups in your industry.

3. **Leverage LinkedIn**: Connect with professionals, engage with content, and build your presence.

4. **Informational Interviews**: Reach out to people in roles you aspire to for advice.

5. **Volunteer**: Non-profit work can expand your network significantly.

**Effective Networking Practices**

- **Give Before You Get**: Offer value before asking for anything
- **Be Authentic**: Build genuine relationships, not transactional ones
- **Follow Up**: Always send a thank-you note within 24 hours
- **Stay in Touch**: Regularly engage with your network
- **Help Others**: The best networkers are also great connectors

**Online Networking Strategies**

- Optimize your LinkedIn profile
- Share valuable content
- Comment meaningfully on others' posts
- Join relevant groups and participate actively
- Create content that showcases your expertise

**The Art of Conversation**

Master these networking conversation starters:
- "What brings you here today?"
- "I'm interested in learning about your role in [industry]"
- "What trends are you seeing in your field?"
- "How did you get started in your career?"

**Maintaining Relationships**

Networking isn't a one-time activity:
- Send periodic updates
- Share relevant articles or opportunities
- Celebrate their achievements
- Attend their events
- Remember important details about them

Remember: Quality over quantity. It's better to have 50 meaningful connections than 500 superficial ones.`,
    category: 'Networking',
    author: 'Career Coach',
    authorType: 'admin',
    image: '🤝',
    readTime: '6 min read',
    tags: ['Networking', 'Career Growth', 'Professional Development'],
    featured: false,
    published: true,
    views: 1800,
    likes: 142,
    seoTitle: 'Networking Strategies for Career Growth and Success',
    seoDescription: 'Learn proven networking techniques to advance your career and build meaningful professional relationships.'
  },
  {
    title: 'Salary Negotiation: Get What You Deserve',
    excerpt: 'Learn proven strategies to negotiate your salary confidently and secure the compensation you deserve.',
    content: `Salary negotiation can be intimidating, but it's a crucial skill that can significantly impact your lifetime earnings. Here's how to negotiate like a pro:

**Why Negotiate?**

Studies show that failing to negotiate your first salary can cost you hundreds of thousands of dollars over your career. Every subsequent raise and bonus is often based on your starting salary.

**Preparation is Key**

1. **Research Market Rates**: Use tools like Glassdoor, PayScale, and LinkedIn to understand salary ranges for your role and location.

2. **Know Your Value**: Make a list of your achievements, skills, and unique contributions.

3. **Set Your Targets**: Determine your minimum acceptable salary, target, and stretch goals.

4. **Practice Your Pitch**: Rehearse what you'll say to avoid sounding uncertain.

**Timing Your Negotiation**

- Wait for the job offer before negotiating
- If they ask about salary expectations, provide a range
- Don't be the first to mention a number if possible
- Consider the entire compensation package, not just base salary

**The Negotiation Process**

1. **Start with Gratitude**: Express excitement about the role

2. **Provide Context**: Reference your research and market standards

3. **Present Your Case**: Highlight your value and achievements

4. **Propose a Number**: Be specific and slightly above your target

5. **Wait Patiently**: Give them time to consider

**Common Negotiation Tactics**

**Handling "We can't go higher"**
- "I understand budget constraints. Could we discuss other benefits?"
- "Is there flexibility on the review timeline for a salary adjustment?"
- "What would make this offer more competitive in the market?"

**Benefits to Negotiate**

Beyond base salary, consider:
- Signing bonus
- Stock options or equity
- Additional vacation days
- Flexible work arrangements
- Professional development budget
- Health benefits
- Commuter benefits
- Telecommuting options

**Avoid These Mistakes**

- Don't accept the first offer immediately
- Don't apologize for negotiating
- Don't make it personal
- Don't show desperation
- Don't burn bridges if it doesn't work out

**If Negotiation Fails**

If they can't meet your number:
- Evaluate the total compensation package
- Consider other benefits
- Assess growth opportunities
- Decide if the role otherwise meets your needs
- Maintain professionalism regardless of outcome

Remember: The best time to negotiate is after you have the offer but before you start. Most employers expect negotiation and have room to move. Confidence and preparation are your strongest tools.`,
    category: 'Salary Negotiation',
    author: 'Compensation Expert',
    authorType: 'admin',
    image: '💰',
    readTime: '9 min read',
    tags: ['Salary', 'Negotiation', 'Career Tips'],
    featured: true,
    published: true,
    views: 5500,
    likes: 320,
    seoTitle: 'Salary Negotiation Guide: Get the Compensation You Deserve',
    seoDescription: 'Master salary negotiation with proven strategies and tactics to maximize your earning potential.'
  },
  {
    title: 'Skills That Will Make You Irreplaceable',
    excerpt: 'Discover the top skills you need to develop to future-proof your career and stand out in any industry.',
    content: `In today's rapidly changing job market, certain skills have become essential for long-term career success. Here are the skills that will make you irreplaceable:

**Technology Skills**

1. **Data Literacy**: Understanding and interpreting data is crucial across industries.

2. **Digital Communication**: Proficiency with collaboration tools and platforms.

3. **Automation Basics**: Understanding how to work with automated systems.

**Soft Skills**

1. **Adaptability**: Ability to quickly learn and adjust to new situations.

2. **Critical Thinking**: Analyzing information objectively and making reasoned decisions.

3. **Creativity**: Finding innovative solutions to complex problems.

4. **Emotional Intelligence**: Understanding and managing your emotions and those of others.

5. **Communication**: Both written and verbal communication skills.

**Leadership Skills**

1. **Coaching**: Helping others grow and develop.

2. **Decision-Making**: Making informed decisions under pressure.

3. **Conflict Resolution**: Navigating disagreements effectively.

4. **Strategic Thinking**: Seeing the big picture and planning ahead.

**Continuous Learning**

The most irreplaceable people are continuous learners. They:
- Stay updated with industry trends
- Take courses and certifications
- Read widely
- Seek feedback
- Embrace new challenges

**How to Develop These Skills**

1. Identify gaps in your skill set
2. Set learning goals
3. Take online courses
4. Practice regularly
5. Seek mentorship
6. Volunteer for challenging projects
7. Join professional communities

Remember: The goal isn't to master everything, but to develop a diverse skill set that makes you uniquely valuable. Focus on continuous improvement and you'll remain irreplaceable.`,
    category: 'Professional Development',
    author: 'Career Strategist',
    authorType: 'admin',
    image: '🚀',
    readTime: '6 min read',
    tags: ['Skills', 'Professional Development', 'Career Growth'],
    featured: false,
    published: true,
    views: 2800,
    likes: 195,
    seoTitle: 'Essential Skills to Future-Proof Your Career',
    seoDescription: 'Discover the key skills that will keep you valuable and irreplaceable in the evolving job market.'
  }
];

async function seedBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to use as author
    const adminUser = await User.findOne({ 
      userType: { $in: ['admin', 'superadmin'] } 
    });

    if (!adminUser) {
      console.error('No admin user found. Creating a dummy ID...');
      process.exit(1);
    }

    console.log('Seeding blogs...');
    
    for (const blog of blogs) {
      // Check if blog already exists
      const existing = await Blog.findOne({ slug: blog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim('-') });
      
      if (!existing) {
        await Blog.create({
          ...blog,
          authorId: adminUser._id,
          authorType: 'admin'
        });
      } else {
        console.log(`Blog "${blog.title}" already exists, skipping...`);
      }
    }

    console.log('✅ Successfully seeded blogs');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

seedBlogs();


const mongoose = require('mongoose');
const Skill = require('./models/Skill');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
});

// Skills data with categories
const skillsData = [
  // Technology & Programming
  { name: 'JavaScript', category: 'Programming', skillType: 'Technical', tags: ['web', 'frontend', 'backend'] },
  { name: 'Python', category: 'Programming', skillType: 'Technical', tags: ['data-science', 'backend', 'ai'] },
  { name: 'Java', category: 'Programming', skillType: 'Technical', tags: ['backend', 'enterprise', 'mobile'] },
  { name: 'React.js', category: 'Technology', skillType: 'Framework', tags: ['frontend', 'ui', 'javascript'] },
  { name: 'Node.js', category: 'Technology', skillType: 'Framework', tags: ['backend', 'javascript', 'server'] },
  { name: 'Angular', category: 'Technology', skillType: 'Framework', tags: ['frontend', 'typescript', 'spa'] },
  { name: 'Vue.js', category: 'Technology', skillType: 'Framework', tags: ['frontend', 'javascript', 'progressive'] },
  { name: 'HTML', category: 'Technology', skillType: 'Technical', tags: ['web', 'markup', 'frontend'] },
  { name: 'CSS', category: 'Technology', skillType: 'Technical', tags: ['web', 'styling', 'frontend'] },
  { name: 'SQL', category: 'Technology', skillType: 'Technical', tags: ['database', 'query', 'data'] },
  { name: 'MongoDB', category: 'Technology', skillType: 'Tool', tags: ['database', 'nosql', 'document'] },
  { name: 'MySQL', category: 'Technology', skillType: 'Tool', tags: ['database', 'sql', 'relational'] },
  { name: 'PostgreSQL', category: 'Technology', skillType: 'Tool', tags: ['database', 'sql', 'open-source'] },
  { name: 'AWS', category: 'Technology', skillType: 'Tool', tags: ['cloud', 'infrastructure', 'amazon'] },
  { name: 'Docker', category: 'Technology', skillType: 'Tool', tags: ['containerization', 'devops', 'deployment'] },
  { name: 'Kubernetes', category: 'Technology', skillType: 'Tool', tags: ['orchestration', 'containers', 'devops'] },
  { name: 'Git', category: 'Technology', skillType: 'Tool', tags: ['version-control', 'collaboration', 'development'] },
  { name: 'GitHub', category: 'Technology', skillType: 'Tool', tags: ['version-control', 'collaboration', 'platform'] },
  { name: 'Linux', category: 'Technology', skillType: 'Technical', tags: ['operating-system', 'server', 'open-source'] },
  { name: 'Windows', category: 'Technology', skillType: 'Technical', tags: ['operating-system', 'desktop', 'microsoft'] },

  // Design & Creative
  { name: 'Adobe Photoshop', category: 'Design', skillType: 'Tool', tags: ['graphics', 'editing', 'creative'] },
  { name: 'Adobe Illustrator', category: 'Design', skillType: 'Tool', tags: ['vector', 'graphics', 'design'] },
  { name: 'Figma', category: 'Design', skillType: 'Tool', tags: ['ui-design', 'prototyping', 'collaboration'] },
  { name: 'UI Design', category: 'Design', skillType: 'Technical', tags: ['user-interface', 'design', 'ux'] },
  { name: 'UX Design', category: 'Design', skillType: 'Technical', tags: ['user-experience', 'design', 'research'] },
  { name: 'Graphic Design', category: 'Design', skillType: 'Technical', tags: ['visual', 'communication', 'creative'] },
  { name: 'Web Design', category: 'Design', skillType: 'Technical', tags: ['web', 'responsive', 'frontend'] },
  { name: 'Video Editing', category: 'Creative', skillType: 'Technical', tags: ['video', 'production', 'media'] },
  { name: 'Photography', category: 'Creative', skillType: 'Technical', tags: ['visual', 'art', 'media'] },
  { name: 'Animation', category: 'Creative', skillType: 'Technical', tags: ['motion', 'graphics', 'visual'] },

  // Marketing & Sales
  { name: 'Digital Marketing', category: 'Marketing', skillType: 'Technical', tags: ['online', 'promotion', 'strategy'] },
  { name: 'Social Media Marketing', category: 'Marketing', skillType: 'Technical', tags: ['social', 'engagement', 'content'] },
  { name: 'SEO', category: 'Marketing', skillType: 'Technical', tags: ['search', 'optimization', 'organic'] },
  { name: 'Google Analytics', category: 'Marketing', skillType: 'Tool', tags: ['analytics', 'tracking', 'data'] },
  { name: 'Content Marketing', category: 'Marketing', skillType: 'Technical', tags: ['content', 'strategy', 'engagement'] },
  { name: 'Email Marketing', category: 'Marketing', skillType: 'Technical', tags: ['email', 'campaigns', 'automation'] },
  { name: 'Sales', category: 'Sales', skillType: 'Soft', tags: ['selling', 'revenue', 'customer'] },
  { name: 'Lead Generation', category: 'Sales', skillType: 'Technical', tags: ['prospects', 'marketing', 'conversion'] },
  { name: 'Customer Relationship Management', category: 'Sales', skillType: 'Technical', tags: ['crm', 'customer', 'management'] },
  { name: 'Business Development', category: 'Sales', skillType: 'Technical', tags: ['growth', 'strategy', 'partnerships'] },

  // Management & Leadership
  { name: 'Project Management', category: 'Management', skillType: 'Technical', tags: ['planning', 'execution', 'leadership'] },
  { name: 'Team Management', category: 'Management', skillType: 'Soft', tags: ['leadership', 'teamwork', 'coordination'] },
  { name: 'Leadership', category: 'Management', skillType: 'Soft', tags: ['influence', 'direction', 'inspiration'] },
  { name: 'Strategic Planning', category: 'Management', skillType: 'Technical', tags: ['strategy', 'planning', 'vision'] },
  { name: 'Operations Management', category: 'Management', skillType: 'Technical', tags: ['processes', 'efficiency', 'optimization'] },
  { name: 'Budget Management', category: 'Management', skillType: 'Technical', tags: ['finance', 'planning', 'control'] },
  { name: 'Risk Management', category: 'Management', skillType: 'Technical', tags: ['assessment', 'mitigation', 'planning'] },
  { name: 'Change Management', category: 'Management', skillType: 'Technical', tags: ['transformation', 'adaptation', 'process'] },
  { name: 'Performance Management', category: 'Management', skillType: 'Technical', tags: ['evaluation', 'improvement', 'goals'] },
  { name: 'Stakeholder Management', category: 'Management', skillType: 'Soft', tags: ['relationships', 'communication', 'influence'] },

  // Communication & Soft Skills
  { name: 'Communication', category: 'Communication', skillType: 'Soft', tags: ['verbal', 'written', 'interpersonal'] },
  { name: 'Public Speaking', category: 'Communication', skillType: 'Soft', tags: ['presentation', 'confidence', 'influence'] },
  { name: 'Writing', category: 'Communication', skillType: 'Soft', tags: ['written', 'content', 'clarity'] },
  { name: 'Presentation Skills', category: 'Communication', skillType: 'Soft', tags: ['presenting', 'visual', 'engagement'] },
  { name: 'Negotiation', category: 'Communication', skillType: 'Soft', tags: ['persuasion', 'agreement', 'influence'] },
  { name: 'Active Listening', category: 'Communication', skillType: 'Soft', tags: ['understanding', 'empathy', 'attention'] },
  { name: 'Problem Solving', category: 'Soft Skills', skillType: 'Soft', tags: ['analysis', 'solution', 'critical-thinking'] },
  { name: 'Critical Thinking', category: 'Soft Skills', skillType: 'Soft', tags: ['analysis', 'evaluation', 'reasoning'] },
  { name: 'Time Management', category: 'Soft Skills', skillType: 'Soft', tags: ['productivity', 'organization', 'efficiency'] },
  { name: 'Adaptability', category: 'Soft Skills', skillType: 'Soft', tags: ['flexibility', 'change', 'resilience'] },

  // Analytics & Data
  { name: 'Data Analysis', category: 'Analytics', skillType: 'Technical', tags: ['data', 'insights', 'statistics'] },
  { name: 'Data Science', category: 'Analytics', skillType: 'Technical', tags: ['machine-learning', 'statistics', 'programming'] },
  { name: 'Machine Learning', category: 'Analytics', skillType: 'Technical', tags: ['ai', 'algorithms', 'prediction'] },
  { name: 'Excel', category: 'Analytics', skillType: 'Tool', tags: ['spreadsheet', 'analysis', 'data'] },
  { name: 'Power BI', category: 'Analytics', skillType: 'Tool', tags: ['visualization', 'business-intelligence', 'data'] },
  { name: 'Tableau', category: 'Analytics', skillType: 'Tool', tags: ['visualization', 'dashboard', 'data'] },
  { name: 'Statistical Analysis', category: 'Analytics', skillType: 'Technical', tags: ['statistics', 'research', 'data'] },
  { name: 'Business Intelligence', category: 'Analytics', skillType: 'Technical', tags: ['insights', 'reporting', 'strategy'] },
  { name: 'Data Visualization', category: 'Analytics', skillType: 'Technical', tags: ['charts', 'dashboard', 'presentation'] },
  { name: 'Predictive Analytics', category: 'Analytics', skillType: 'Technical', tags: ['forecasting', 'prediction', 'modeling'] },

  // Engineering
  { name: 'AutoCAD', category: 'Engineering', skillType: 'Tool', tags: ['cad', 'design', 'engineering'] },
  { name: 'SolidWorks', category: 'Engineering', skillType: 'Tool', tags: ['cad', '3d', 'mechanical'] },
  { name: 'Mechanical Engineering', category: 'Engineering', skillType: 'Technical', tags: ['design', 'manufacturing', 'systems'] },
  { name: 'Civil Engineering', category: 'Engineering', skillType: 'Technical', tags: ['construction', 'infrastructure', 'design'] },
  { name: 'Electrical Engineering', category: 'Engineering', skillType: 'Technical', tags: ['electrical', 'power', 'systems'] },
  { name: 'Chemical Engineering', category: 'Engineering', skillType: 'Technical', tags: ['chemical', 'process', 'manufacturing'] },
  { name: 'Quality Control', category: 'Engineering', skillType: 'Technical', tags: ['testing', 'standards', 'assurance'] },
  { name: 'Process Improvement', category: 'Engineering', skillType: 'Technical', tags: ['optimization', 'efficiency', 'lean'] },
  { name: 'Six Sigma', category: 'Engineering', skillType: 'Certification', tags: ['quality', 'process', 'methodology'] },
  { name: 'Lean Manufacturing', category: 'Engineering', skillType: 'Technical', tags: ['efficiency', 'waste-reduction', 'process'] },

  // Finance & Accounting
  { name: 'Accounting', category: 'Finance', skillType: 'Technical', tags: ['financial', 'records', 'bookkeeping'] },
  { name: 'Financial Analysis', category: 'Finance', skillType: 'Technical', tags: ['analysis', 'investment', 'valuation'] },
  { name: 'Budgeting', category: 'Finance', skillType: 'Technical', tags: ['planning', 'forecasting', 'control'] },
  { name: 'Tally', category: 'Finance', skillType: 'Tool', tags: ['accounting', 'software', 'erp'] },
  { name: 'SAP', category: 'Finance', skillType: 'Tool', tags: ['erp', 'enterprise', 'business'] },
  { name: 'QuickBooks', category: 'Finance', skillType: 'Tool', tags: ['accounting', 'small-business', 'bookkeeping'] },
  { name: 'Taxation', category: 'Finance', skillType: 'Technical', tags: ['tax', 'compliance', 'planning'] },
  { name: 'Auditing', category: 'Finance', skillType: 'Technical', tags: ['review', 'compliance', 'verification'] },
  { name: 'Investment Analysis', category: 'Finance', skillType: 'Technical', tags: ['investment', 'portfolio', 'risk'] },
  { name: 'Financial Modeling', category: 'Finance', skillType: 'Technical', tags: ['forecasting', 'valuation', 'excel'] },

  // Healthcare
  { name: 'Patient Care', category: 'Healthcare', skillType: 'Soft', tags: ['care', 'empathy', 'medical'] },
  { name: 'Medical Coding', category: 'Healthcare', skillType: 'Technical', tags: ['coding', 'billing', 'medical'] },
  { name: 'Clinical Research', category: 'Healthcare', skillType: 'Technical', tags: ['research', 'trials', 'medical'] },
  { name: 'Nursing', category: 'Healthcare', skillType: 'Technical', tags: ['patient-care', 'medical', 'health'] },
  { name: 'Pharmacy', category: 'Healthcare', skillType: 'Technical', tags: ['medication', 'dispensing', 'medical'] },
  { name: 'Healthcare Administration', category: 'Healthcare', skillType: 'Technical', tags: ['management', 'healthcare', 'operations'] },
  { name: 'Medical Terminology', category: 'Healthcare', skillType: 'Technical', tags: ['medical', 'language', 'terminology'] },
  { name: 'HIPAA Compliance', category: 'Healthcare', skillType: 'Certification', tags: ['privacy', 'compliance', 'medical'] },
  { name: 'Electronic Health Records', category: 'Healthcare', skillType: 'Technical', tags: ['ehr', 'digital', 'medical'] },
  { name: 'Telemedicine', category: 'Healthcare', skillType: 'Technical', tags: ['remote', 'digital', 'healthcare'] },

  // Customer Service
  { name: 'Customer Service', category: 'Customer Service', skillType: 'Soft', tags: ['support', 'help', 'satisfaction'] },
  { name: 'Customer Support', category: 'Customer Service', skillType: 'Soft', tags: ['assistance', 'help', 'resolution'] },
  { name: 'Call Center', category: 'Customer Service', skillType: 'Technical', tags: ['phone', 'support', 'communication'] },
  { name: 'Help Desk', category: 'Customer Service', skillType: 'Technical', tags: ['technical-support', 'troubleshooting', 'it'] },
  { name: 'Conflict Resolution', category: 'Customer Service', skillType: 'Soft', tags: ['mediation', 'problem-solving', 'communication'] },
  { name: 'Complaint Handling', category: 'Customer Service', skillType: 'Soft', tags: ['complaints', 'resolution', 'satisfaction'] },
  { name: 'Customer Retention', category: 'Customer Service', skillType: 'Technical', tags: ['loyalty', 'satisfaction', 'retention'] },
  { name: 'Customer Satisfaction', category: 'Customer Service', skillType: 'Soft', tags: ['satisfaction', 'experience', 'quality'] },
  { name: 'Service Delivery', category: 'Customer Service', skillType: 'Technical', tags: ['delivery', 'quality', 'standards'] },
  { name: 'Customer Relationship Management', category: 'Customer Service', skillType: 'Technical', tags: ['crm', 'relationships', 'management'] },

  // Human Resources
  { name: 'Recruitment', category: 'Human Resources', skillType: 'Technical', tags: ['hiring', 'talent', 'selection'] },
  { name: 'Talent Acquisition', category: 'Human Resources', skillType: 'Technical', tags: ['hiring', 'sourcing', 'talent'] },
  { name: 'Employee Relations', category: 'Human Resources', skillType: 'Soft', tags: ['relationships', 'conflict', 'engagement'] },
  { name: 'Training and Development', category: 'Human Resources', skillType: 'Technical', tags: ['learning', 'development', 'skills'] },
  { name: 'Performance Management', category: 'Human Resources', skillType: 'Technical', tags: ['evaluation', 'goals', 'feedback'] },
  { name: 'HR Analytics', category: 'Human Resources', skillType: 'Technical', tags: ['data', 'insights', 'metrics'] },
  { name: 'Compensation and Benefits', category: 'Human Resources', skillType: 'Technical', tags: ['pay', 'benefits', 'compensation'] },
  { name: 'Workforce Planning', category: 'Human Resources', skillType: 'Technical', tags: ['planning', 'forecasting', 'staffing'] },
  { name: 'Diversity and Inclusion', category: 'Human Resources', skillType: 'Soft', tags: ['diversity', 'inclusion', 'equity'] },
  { name: 'Labor Relations', category: 'Human Resources', skillType: 'Technical', tags: ['unions', 'negotiations', 'compliance'] },

  // Operations
  { name: 'Supply Chain Management', category: 'Operations', skillType: 'Technical', tags: ['logistics', 'procurement', 'distribution'] },
  { name: 'Inventory Management', category: 'Operations', skillType: 'Technical', tags: ['stock', 'warehouse', 'control'] },
  { name: 'Logistics', category: 'Operations', skillType: 'Technical', tags: ['transportation', 'distribution', 'coordination'] },
  { name: 'Procurement', category: 'Operations', skillType: 'Technical', tags: ['purchasing', 'sourcing', 'vendor'] },
  { name: 'Vendor Management', category: 'Operations', skillType: 'Technical', tags: ['suppliers', 'relationships', 'performance'] },
  { name: 'Quality Assurance', category: 'Operations', skillType: 'Technical', tags: ['quality', 'testing', 'standards'] },
  { name: 'Process Optimization', category: 'Operations', skillType: 'Technical', tags: ['efficiency', 'improvement', 'lean'] },
  { name: 'Warehouse Management', category: 'Operations', skillType: 'Technical', tags: ['storage', 'inventory', 'logistics'] },
  { name: 'Distribution', category: 'Operations', skillType: 'Technical', tags: ['delivery', 'logistics', 'coordination'] },
  { name: 'Fleet Management', category: 'Operations', skillType: 'Technical', tags: ['vehicles', 'transportation', 'maintenance'] },

  // Language Skills
  { name: 'English', category: 'Language', skillType: 'Language', tags: ['communication', 'international', 'business'] },
  { name: 'Hindi', category: 'Language', skillType: 'Language', tags: ['indian', 'regional', 'communication'] },
  { name: 'Spanish', category: 'Language', skillType: 'Language', tags: ['international', 'global', 'communication'] },
  { name: 'French', category: 'Language', skillType: 'Language', tags: ['international', 'european', 'communication'] },
  { name: 'German', category: 'Language', skillType: 'Language', tags: ['international', 'european', 'business'] },
  { name: 'Chinese', category: 'Language', skillType: 'Language', tags: ['international', 'asian', 'business'] },
  { name: 'Japanese', category: 'Language', skillType: 'Language', tags: ['international', 'asian', 'business'] },
  { name: 'Arabic', category: 'Language', skillType: 'Language', tags: ['international', 'middle-east', 'business'] },
  { name: 'Portuguese', category: 'Language', skillType: 'Language', tags: ['international', 'latin-america', 'business'] },
  { name: 'Russian', category: 'Language', skillType: 'Language', tags: ['international', 'european', 'business'] },

  // Additional Technical Skills
  { name: 'Cybersecurity', category: 'Technology', skillType: 'Technical', tags: ['security', 'protection', 'it'] },
  { name: 'Cloud Computing', category: 'Technology', skillType: 'Technical', tags: ['cloud', 'infrastructure', 'scalability'] },
  { name: 'DevOps', category: 'Technology', skillType: 'Technical', tags: ['development', 'operations', 'automation'] },
  { name: 'API Development', category: 'Technology', skillType: 'Technical', tags: ['api', 'integration', 'backend'] },
  { name: 'Microservices', category: 'Technology', skillType: 'Technical', tags: ['architecture', 'scalability', 'services'] },
  { name: 'Mobile App Development', category: 'Technology', skillType: 'Technical', tags: ['mobile', 'apps', 'development'] },
  { name: 'Game Development', category: 'Technology', skillType: 'Technical', tags: ['games', 'entertainment', 'programming'] },
  { name: 'Blockchain', category: 'Technology', skillType: 'Technical', tags: ['cryptocurrency', 'distributed', 'security'] },
  { name: 'Artificial Intelligence', category: 'Technology', skillType: 'Technical', tags: ['ai', 'machine-learning', 'automation'] },
  { name: 'Internet of Things', category: 'Technology', skillType: 'Technical', tags: ['iot', 'connected', 'devices'] }
];

async function seedSkills() {
  try {
    console.log('Starting to seed skills...');
    
    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');
    
    // Insert new skills
    const insertedSkills = await Skill.insertMany(skillsData);
    console.log(`Successfully seeded ${insertedSkills.length} skills`);
    
    // Mark all as verified since they are predefined
    await Skill.updateMany({}, { isVerified: true });
    console.log('Marked all skills as verified');
    
    console.log('Skills seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding skills:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
seedSkills();

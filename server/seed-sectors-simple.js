const mongoose = require('mongoose');
const Sector = require('./models/Sector');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const seedSectorsSimple = async () => {
  try {
    console.log('🌱 Starting simple sectors seeding...');

    // Clear existing sectors
    await Sector.deleteMany({});
    console.log('🗑️ Cleared existing sectors data');

    // Sample sectors data
    const sectors = [
      // Technology Sectors
      { name: 'Software Development', industry: 'Information Technology', description: 'Custom software development and programming services' },
      { name: 'IT Services', industry: 'Information Technology', description: 'IT consulting, support, and managed services' },
      { name: 'Cybersecurity', industry: 'Information Technology', description: 'Information security and cyber threat protection' },
      { name: 'Cloud Computing', industry: 'Information Technology', description: 'Cloud infrastructure and platform services' },
      { name: 'Data Analytics', industry: 'Information Technology', description: 'Big data analysis and business intelligence' },
      { name: 'Artificial Intelligence', industry: 'Information Technology', description: 'AI/ML solutions and automation services' },
      { name: 'Mobile App Development', industry: 'Information Technology', description: 'Mobile application development and maintenance' },
      { name: 'Web Development', industry: 'Information Technology', description: 'Website design and development services' },

      // Healthcare Sectors
      { name: 'Hospitals', industry: 'Healthcare & Medical', description: 'General and specialized hospital services' },
      { name: 'Pharmaceuticals', industry: 'Healthcare & Medical', description: 'Drug development and manufacturing' },
      { name: 'Medical Devices', industry: 'Healthcare & Medical', description: 'Medical equipment and device manufacturing' },
      { name: 'Telemedicine', industry: 'Healthcare & Medical', description: 'Remote healthcare and digital health services' },
      { name: 'Mental Health', industry: 'Healthcare & Medical', description: 'Psychiatric and psychological services' },
      { name: 'Dental Care', industry: 'Healthcare & Medical', description: 'Dental services and oral healthcare' },

      // Finance Sectors
      { name: 'Commercial Banking', industry: 'Banking & Financial Services', description: 'Retail and commercial banking services' },
      { name: 'Investment Banking', industry: 'Banking & Financial Services', description: 'Corporate finance and investment services' },
      { name: 'Insurance', industry: 'Banking & Financial Services', description: 'Life, health, and property insurance' },
      { name: 'Fintech', industry: 'Banking & Financial Services', description: 'Financial technology and digital payments' },
      { name: 'Asset Management', industry: 'Banking & Financial Services', description: 'Investment and wealth management services' },
      { name: 'Credit Services', industry: 'Banking & Financial Services', description: 'Credit cards and lending services' },

      // Manufacturing Sectors
      { name: 'Automotive Manufacturing', industry: 'Manufacturing & Production', description: 'Vehicle and automotive parts production' },
      { name: 'Electronics Manufacturing', industry: 'Manufacturing & Production', description: 'Electronic components and devices' },
      { name: 'Textile Manufacturing', industry: 'Manufacturing & Production', description: 'Fabric and clothing production' },
      { name: 'Food Processing', industry: 'Manufacturing & Production', description: 'Food production and packaging' },
      { name: 'Chemical Manufacturing', industry: 'Manufacturing & Production', description: 'Chemical products and materials' },
      { name: 'Machinery Manufacturing', industry: 'Manufacturing & Production', description: 'Industrial machinery and equipment' },

      // Education Sectors
      { name: 'Higher Education', industry: 'Education & Training', description: 'Universities and colleges' },
      { name: 'K-12 Education', industry: 'Education & Training', description: 'Primary and secondary schools' },
      { name: 'Online Learning', industry: 'Education & Training', description: 'E-learning platforms and courses' },
      { name: 'Corporate Training', industry: 'Education & Training', description: 'Professional development and training' },
      { name: 'Vocational Training', industry: 'Education & Training', description: 'Skills-based training programs' },
      { name: 'Language Learning', industry: 'Education & Training', description: 'Language instruction and courses' },

      // Retail Sectors
      { name: 'E-commerce', industry: 'Retail & E-commerce', description: 'Online retail and marketplace platforms' },
      { name: 'Fashion Retail', industry: 'Retail & E-commerce', description: 'Clothing and fashion retail' },
      { name: 'Electronics Retail', industry: 'Retail & E-commerce', description: 'Consumer electronics and gadgets' },
      { name: 'Grocery Retail', industry: 'Retail & E-commerce', description: 'Food and grocery retail' },
      { name: 'Home & Garden', industry: 'Retail & E-commerce', description: 'Home improvement and garden supplies' },
      { name: 'Beauty & Personal Care', industry: 'Retail & E-commerce', description: 'Cosmetics and personal care products' },

      // Real Estate Sectors
      { name: 'Residential Real Estate', industry: 'Real Estate & Construction', description: 'Housing and residential properties' },
      { name: 'Commercial Real Estate', industry: 'Real Estate & Construction', description: 'Office buildings and commercial spaces' },
      { name: 'Construction', industry: 'Real Estate & Construction', description: 'Building and infrastructure construction' },
      { name: 'Property Management', industry: 'Real Estate & Construction', description: 'Property maintenance and management' },
      { name: 'Real Estate Development', industry: 'Real Estate & Construction', description: 'Land development and project management' },

      // Media Sectors
      { name: 'Digital Media', industry: 'Media & Entertainment', description: 'Online content and digital platforms' },
      { name: 'Broadcasting', industry: 'Media & Entertainment', description: 'Television and radio broadcasting' },
      { name: 'Film Production', industry: 'Media & Entertainment', description: 'Movie and video production' },
      { name: 'Music Industry', industry: 'Media & Entertainment', description: 'Music production and distribution' },
      { name: 'Publishing', industry: 'Media & Entertainment', description: 'Books, magazines, and digital publishing' },
      { name: 'Gaming', industry: 'Media & Entertainment', description: 'Video game development and publishing' },

      // Automotive Sectors
      { name: 'Auto Parts', industry: 'Automotive', description: 'Automotive components and spare parts' },
      { name: 'Auto Dealerships', industry: 'Automotive', description: 'Vehicle sales and service centers' },
      { name: 'Auto Repair', industry: 'Automotive', description: 'Vehicle maintenance and repair services' },
      { name: 'Electric Vehicles', industry: 'Automotive', description: 'EV manufacturing and charging infrastructure' }
    ];

    // Insert sectors using insertMany
    console.log(`Inserting ${sectors.length} sectors...`);
    await Sector.insertMany(sectors);
    console.log(`✅ Successfully inserted ${sectors.length} sectors`);

    // Verify insertion
    const count = await Sector.countDocuments();
    console.log(`✅ Total sectors in database: ${count}`);

    console.log('🎉 Sectors seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding sectors:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedSectorsSimple();

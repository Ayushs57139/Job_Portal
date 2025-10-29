const mongoose = require('mongoose');
const Course = require('./models/Course');
const Specialization = require('./models/Specialization');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const seedBachelorSpecializations = async () => {
  try {
    console.log('🌱 Starting Bachelor specializations seeding...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ userType: 'superadmin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Bachelor Specializations - B.A
    const baSpecializations = [
      { name: 'Acting', field: 'Arts', level: 'Graduate', description: 'Acting specialization', createdBy: adminUser._id },
      { name: 'Accounting and Finance', field: 'Business', level: 'Graduate', description: 'Accounting and Finance specialization', createdBy: adminUser._id },
      { name: 'Anthropology', field: 'Arts', level: 'Graduate', description: 'Anthropology specialization', createdBy: adminUser._id },
      { name: 'Arts & Humanities', field: 'Arts', level: 'Graduate', description: 'Arts & Humanities specialization', createdBy: adminUser._id },
      { name: 'Agriculture', field: 'Science', level: 'Graduate', description: 'Agriculture specialization', createdBy: adminUser._id },
      { name: 'Ancient History', field: 'Arts', level: 'Graduate', description: 'Ancient History specialization', createdBy: adminUser._id },
      { name: 'Arabic', field: 'Arts', level: 'Graduate', description: 'Arabic specialization', createdBy: adminUser._id },
      { name: 'Arts and Law', field: 'Law', level: 'Graduate', description: 'Arts and Law specialization', createdBy: adminUser._id },
      { name: 'Assamese', field: 'Arts', level: 'Graduate', description: 'Assamese specialization', createdBy: adminUser._id },
      { name: 'Astrology', field: 'Arts', level: 'Graduate', description: 'Astrology specialization', createdBy: adminUser._id },
      { name: 'Bengali', field: 'Arts', level: 'Graduate', description: 'Bengali specialization', createdBy: adminUser._id },
      { name: 'Bharatanatyam', field: 'Arts', level: 'Graduate', description: 'Bharatanatyam specialization', createdBy: adminUser._id },
      { name: 'Carnatic Music', field: 'Arts', level: 'Graduate', description: 'Carnatic Music specialization', createdBy: adminUser._id },
      { name: 'Comparative Literature', field: 'Arts', level: 'Graduate', description: 'Comparative Literature specialization', createdBy: adminUser._id },
      { name: 'Computer Applications', field: 'Technology', level: 'Graduate', description: 'Computer Applications specialization', createdBy: adminUser._id },
      { name: 'Computer Science', field: 'Technology', level: 'Graduate', description: 'Computer Science specialization', createdBy: adminUser._id },
      { name: 'Co-Operation', field: 'Business', level: 'Graduate', description: 'Co-Operation specialization', createdBy: adminUser._id },
      { name: 'Corporate Economics', field: 'Business', level: 'Graduate', description: 'Corporate Economics specialization', createdBy: adminUser._id },
      { name: 'Corporate Secretaryship', field: 'Business', level: 'Graduate', description: 'Corporate Secretaryship specialization', createdBy: adminUser._id },
      { name: 'Criminology and Police Administration', field: 'Arts', level: 'Graduate', description: 'Criminology and Police Administration specialization', createdBy: adminUser._id },
      { name: 'Culinary Arts', field: 'Arts', level: 'Graduate', description: 'Culinary Arts specialization', createdBy: adminUser._id },
      { name: 'Defence & Strategic Studies', field: 'Arts', level: 'Graduate', description: 'Defence & Strategic Studies specialization', createdBy: adminUser._id },
      { name: 'Drawing and Painting', field: 'Arts', level: 'Graduate', description: 'Drawing and Painting specialization', createdBy: adminUser._id },
      { name: 'Economics', field: 'Business', level: 'Graduate', description: 'Economics specialization', createdBy: adminUser._id },
      { name: 'Education', field: 'Education', level: 'Graduate', description: 'Education specialization', createdBy: adminUser._id },
      { name: 'English', field: 'Arts', level: 'Graduate', description: 'English specialization', createdBy: adminUser._id },
      { name: 'Fashion Design', field: 'Arts', level: 'Graduate', description: 'Fashion Design specialization', createdBy: adminUser._id },
      { name: 'French', field: 'Arts', level: 'Graduate', description: 'French specialization', createdBy: adminUser._id },
      { name: 'Graphic Design', field: 'Arts', level: 'Graduate', description: 'Graphic Design specialization', createdBy: adminUser._id },
      { name: 'Gujarati', field: 'Arts', level: 'Graduate', description: 'Gujarati specialization', createdBy: adminUser._id },
      { name: 'Hindi', field: 'Arts', level: 'Graduate', description: 'Hindi specialization', createdBy: adminUser._id },
      { name: 'History', field: 'Arts', level: 'Graduate', description: 'History specialization', createdBy: adminUser._id },
      { name: 'Home Science', field: 'Science', level: 'Graduate', description: 'Home Science specialization', createdBy: adminUser._id },
      { name: 'Hotel Management', field: 'Business', level: 'Graduate', description: 'Hotel Management specialization', createdBy: adminUser._id },
      { name: 'HP Operations Manager', field: 'Business', level: 'Graduate', description: 'HP Operations Manager specialization', createdBy: adminUser._id },
      { name: 'Humanities', field: 'Arts', level: 'Graduate', description: 'Humanities specialization', createdBy: adminUser._id },
      { name: 'Human Resources', field: 'Business', level: 'Graduate', description: 'Human Resources specialization', createdBy: adminUser._id },
      { name: 'Interior Design', field: 'Arts', level: 'Graduate', description: 'Interior Design specialization', createdBy: adminUser._id },
      { name: 'Islamic History', field: 'Arts', level: 'Graduate', description: 'Islamic History specialization', createdBy: adminUser._id },
      { name: 'Journalism', field: 'Arts', level: 'Graduate', description: 'Journalism specialization', createdBy: adminUser._id },
      { name: 'Journalism and Mass Communication', field: 'Arts', level: 'Graduate', description: 'Journalism and Mass Communication specialization', createdBy: adminUser._id },
      { name: 'Kannada', field: 'Arts', level: 'Graduate', description: 'Kannada specialization', createdBy: adminUser._id },
      { name: 'Maithili', field: 'Arts', level: 'Graduate', description: 'Maithili specialization', createdBy: adminUser._id },
      { name: 'Malayalam', field: 'Arts', level: 'Graduate', description: 'Malayalam specialization', createdBy: adminUser._id },
      { name: 'Marathi', field: 'Arts', level: 'Graduate', description: 'Marathi specialization', createdBy: adminUser._id },
      { name: 'Mass Communication', field: 'Arts', level: 'Graduate', description: 'Mass Communication specialization', createdBy: adminUser._id },
      { name: 'Military Studies', field: 'Arts', level: 'Graduate', description: 'Military Studies specialization', createdBy: adminUser._id },
      { name: 'Music', field: 'Arts', level: 'Graduate', description: 'Music specialization', createdBy: adminUser._id },
      { name: 'Music Vocal', field: 'Arts', level: 'Graduate', description: 'Music Vocal specialization', createdBy: adminUser._id },
      { name: 'Office Management', field: 'Business', level: 'Graduate', description: 'Office Management specialization', createdBy: adminUser._id },
      { name: 'Persian', field: 'Arts', level: 'Graduate', description: 'Persian specialization', createdBy: adminUser._id },
      { name: 'Philosophy', field: 'Arts', level: 'Graduate', description: 'Philosophy specialization', createdBy: adminUser._id },
      { name: 'Photography', field: 'Arts', level: 'Graduate', description: 'Photography specialization', createdBy: adminUser._id },
      { name: 'Physical Education', field: 'Education', level: 'Graduate', description: 'Physical Education specialization', createdBy: adminUser._id },
      { name: 'Political Science', field: 'Arts', level: 'Graduate', description: 'Political Science specialization', createdBy: adminUser._id },
      { name: 'Psychology', field: 'Arts', level: 'Graduate', description: 'Psychology specialization', createdBy: adminUser._id },
      { name: 'Psychology, Physical Education, Tourism, Travel Management', field: 'Arts', level: 'Graduate', description: 'Psychology, Physical Education, Tourism, Travel Management specialization', createdBy: adminUser._id },
      { name: 'Public Administration', field: 'Business', level: 'Graduate', description: 'Public Administration specialization', createdBy: adminUser._id },
      { name: 'Punjabi', field: 'Arts', level: 'Graduate', description: 'Punjabi specialization', createdBy: adminUser._id },
      { name: 'Rural Development', field: 'Business', level: 'Graduate', description: 'Rural Development specialization', createdBy: adminUser._id },
      { name: 'Sanskrit', field: 'Arts', level: 'Graduate', description: 'Sanskrit specialization', createdBy: adminUser._id },
      { name: 'Shastri', field: 'Arts', level: 'Graduate', description: 'Shastri specialization', createdBy: adminUser._id },
      { name: 'Social Sciences', field: 'Arts', level: 'Graduate', description: 'Social Sciences specialization', createdBy: adminUser._id },
      { name: 'Social Work', field: 'Arts', level: 'Graduate', description: 'Social Work specialization', createdBy: adminUser._id },
      { name: 'Sociology', field: 'Arts', level: 'Graduate', description: 'Sociology specialization', createdBy: adminUser._id },
      { name: 'Tamil', field: 'Arts', level: 'Graduate', description: 'Tamil specialization', createdBy: adminUser._id },
      { name: 'Telugu', field: 'Arts', level: 'Graduate', description: 'Telugu specialization', createdBy: adminUser._id },
      { name: 'Travel and Tourism Management', field: 'Business', level: 'Graduate', description: 'Travel and Tourism Management specialization', createdBy: adminUser._id },
      { name: 'Urdu Literature', field: 'Arts', level: 'Graduate', description: 'Urdu Literature specialization', createdBy: adminUser._id },
      { name: 'Visual Communication', field: 'Arts', level: 'Graduate', description: 'Visual Communication specialization', createdBy: adminUser._id },
      { name: 'Women\'s Studies', field: 'Arts', level: 'Graduate', description: 'Women\'s Studies specialization', createdBy: adminUser._id },
      { name: 'Yogashastra', field: 'Arts', level: 'Graduate', description: 'Yogashastra specialization', createdBy: adminUser._id },
      { name: 'Other', field: 'Other', level: 'Graduate', description: 'Other B.A specializations', createdBy: adminUser._id }
    ];

    // Insert specializations
    console.log(`Inserting ${baSpecializations.length} B.A specializations...`);
    await Specialization.insertMany(baSpecializations);
    console.log(`✅ Successfully inserted ${baSpecializations.length} B.A specializations`);

    console.log('🎉 Bachelor specializations seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding bachelor specializations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedBachelorSpecializations();

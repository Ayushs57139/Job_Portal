const mongoose = require('mongoose');
const Course = require('./models/Course');
const Specialization = require('./models/Specialization');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const seedCoursesAndSpecializations = async () => {
  try {
    console.log('🌱 Starting courses and specializations seeding...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ userType: 'superadmin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing data
    await Course.deleteMany({});
    await Specialization.deleteMany({});
    console.log('🗑️ Cleared existing courses and specializations data');

    // Sample courses data with correct enum values
    const courses = [
      // Technology Courses
      { name: 'Computer Science Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor degree in computer science', createdBy: adminUser._id },
      { name: 'Information Technology', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor degree in information technology', createdBy: adminUser._id },
      { name: 'Software Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor degree in software engineering', createdBy: adminUser._id },
      { name: 'Data Science', category: 'Technical', level: 'Post Graduate', duration: '2 years', description: 'Master degree in data science', createdBy: adminUser._id },
      { name: 'Artificial Intelligence', category: 'Technical', level: 'Post Graduate', duration: '2 years', description: 'Master degree in AI', createdBy: adminUser._id },
      { name: 'Cybersecurity', category: 'Technical', level: 'Post Graduate', duration: '2 years', description: 'Master degree in cybersecurity', createdBy: adminUser._id },
      { name: 'Cloud Computing', category: 'Technical', level: 'Certificate', duration: '1 year', description: 'Certificate in cloud computing', createdBy: adminUser._id },
      { name: 'Full Stack Development', category: 'Technical', level: 'Diploma', duration: '6 months', description: 'Diploma in full stack development', createdBy: adminUser._id },

      // Business Courses
      { name: 'Master of Business Administration', category: 'Management', level: 'Post Graduate', duration: '2 years', description: 'MBA program', createdBy: adminUser._id },
      { name: 'Bachelor of Business Administration', category: 'Management', level: 'Graduate', duration: '3 years', description: 'BBA program', createdBy: adminUser._id },
      { name: 'Digital Marketing', category: 'Management', level: 'Certificate', duration: '1 year', description: 'Certificate in digital marketing', createdBy: adminUser._id },
      { name: 'Project Management', category: 'Management', level: 'Certificate', duration: '6 months', description: 'Certificate in project management', createdBy: adminUser._id },
      { name: 'Human Resource Management', category: 'Management', level: 'Diploma', duration: '1 year', description: 'Diploma in HR management', createdBy: adminUser._id },
      { name: 'Financial Management', category: 'Management', level: 'Diploma', duration: '1 year', description: 'Diploma in financial management', createdBy: adminUser._id },

      // Healthcare Courses
      { name: 'Bachelor of Medicine and Bachelor of Surgery', category: 'Medical', level: 'Graduate', duration: '5.5 years', description: 'MBBS degree', createdBy: adminUser._id },
      { name: 'Bachelor of Dental Surgery', category: 'Medical', level: 'Graduate', duration: '5 years', description: 'BDS degree', createdBy: adminUser._id },
      { name: 'Bachelor of Pharmacy', category: 'Medical', level: 'Graduate', duration: '4 years', description: 'B.Pharm degree', createdBy: adminUser._id },
      { name: 'Nursing', category: 'Medical', level: 'Graduate', duration: '4 years', description: 'Bachelor of Nursing', createdBy: adminUser._id },
      { name: 'Physiotherapy', category: 'Medical', level: 'Graduate', duration: '4 years', description: 'Bachelor of Physiotherapy', createdBy: adminUser._id },
      { name: 'Medical Laboratory Technology', category: 'Medical', level: 'Diploma', duration: '3 years', description: 'Diploma in MLT', createdBy: adminUser._id },

      // Engineering Courses
      { name: 'Mechanical Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in mechanical engineering', createdBy: adminUser._id },
      { name: 'Civil Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in civil engineering', createdBy: adminUser._id },
      { name: 'Electrical Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in electrical engineering', createdBy: adminUser._id },
      { name: 'Chemical Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in chemical engineering', createdBy: adminUser._id },
      { name: 'Electronics Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in electronics engineering', createdBy: adminUser._id },
      { name: 'Aerospace Engineering', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor in aerospace engineering', createdBy: adminUser._id },

      // Arts & Humanities
      { name: 'Bachelor of Arts', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'BA degree', createdBy: adminUser._id },
      { name: 'Master of Arts', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'MA degree', createdBy: adminUser._id },
      { name: 'Journalism and Mass Communication', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor in journalism', createdBy: adminUser._id },
      { name: 'Psychology', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor in psychology', createdBy: adminUser._id },
      { name: 'English Literature', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor in English literature', createdBy: adminUser._id },
      { name: 'History', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor in history', createdBy: adminUser._id },

      // Science Courses
      { name: 'Bachelor of Science', category: 'Science', level: 'Graduate', duration: '3 years', description: 'BSc degree', createdBy: adminUser._id },
      { name: 'Master of Science', category: 'Science', level: 'Post Graduate', duration: '2 years', description: 'MSc degree', createdBy: adminUser._id },
      { name: 'Physics', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor in physics', createdBy: adminUser._id },
      { name: 'Chemistry', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor in chemistry', createdBy: adminUser._id },
      { name: 'Mathematics', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor in mathematics', createdBy: adminUser._id },
      { name: 'Biology', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor in biology', createdBy: adminUser._id }
    ];

    // Sample specializations data with correct enum values
    const specializations = [
      // Technology Specializations
      { name: 'Web Development', field: 'Technology', level: 'Graduate', description: 'Specialization in web technologies', createdBy: adminUser._id },
      { name: 'Mobile App Development', field: 'Technology', level: 'Graduate', description: 'Specialization in mobile app development', createdBy: adminUser._id },
      { name: 'Machine Learning', field: 'Technology', level: 'Post Graduate', description: 'Specialization in ML algorithms', createdBy: adminUser._id },
      { name: 'Deep Learning', field: 'Technology', level: 'Post Graduate', description: 'Specialization in deep learning', createdBy: adminUser._id },
      { name: 'Network Security', field: 'Technology', level: 'Post Graduate', description: 'Specialization in network security', createdBy: adminUser._id },
      { name: 'Cloud Architecture', field: 'Technology', level: 'Certificate', description: 'Specialization in cloud architecture', createdBy: adminUser._id },

      // Business Specializations
      { name: 'Marketing Management', field: 'Business', level: 'Post Graduate', description: 'Specialization in marketing', createdBy: adminUser._id },
      { name: 'Finance', field: 'Business', level: 'Post Graduate', description: 'Specialization in finance', createdBy: adminUser._id },
      { name: 'Operations Management', field: 'Business', level: 'Post Graduate', description: 'Specialization in operations', createdBy: adminUser._id },
      { name: 'Human Resources', field: 'Business', level: 'Post Graduate', description: 'Specialization in HR', createdBy: adminUser._id },
      { name: 'Digital Marketing Strategy', field: 'Business', level: 'Certificate', description: 'Specialization in digital marketing strategy', createdBy: adminUser._id },
      { name: 'Agile Project Management', field: 'Business', level: 'Certificate', description: 'Specialization in agile methodologies', createdBy: adminUser._id },

      // Healthcare Specializations
      { name: 'Cardiology', field: 'Medicine', level: 'Graduate', description: 'Specialization in heart diseases', createdBy: adminUser._id },
      { name: 'Neurology', field: 'Medicine', level: 'Graduate', description: 'Specialization in nervous system', createdBy: adminUser._id },
      { name: 'Orthodontics', field: 'Medicine', level: 'Graduate', description: 'Specialization in teeth alignment', createdBy: adminUser._id },
      { name: 'Clinical Pharmacy', field: 'Medicine', level: 'Graduate', description: 'Specialization in clinical pharmacy', createdBy: adminUser._id },
      { name: 'Pediatric Nursing', field: 'Medicine', level: 'Graduate', description: 'Specialization in child care nursing', createdBy: adminUser._id },
      { name: 'Sports Physiotherapy', field: 'Medicine', level: 'Graduate', description: 'Specialization in sports injury treatment', createdBy: adminUser._id },

      // Engineering Specializations
      { name: 'Automotive Engineering', field: 'Engineering', level: 'Graduate', description: 'Specialization in automotive systems', createdBy: adminUser._id },
      { name: 'Structural Engineering', field: 'Engineering', level: 'Graduate', description: 'Specialization in building structures', createdBy: adminUser._id },
      { name: 'Power Systems', field: 'Engineering', level: 'Graduate', description: 'Specialization in electrical power', createdBy: adminUser._id },
      { name: 'Process Engineering', field: 'Engineering', level: 'Graduate', description: 'Specialization in chemical processes', createdBy: adminUser._id },
      { name: 'VLSI Design', field: 'Engineering', level: 'Graduate', description: 'Specialization in chip design', createdBy: adminUser._id },
      { name: 'Aircraft Design', field: 'Engineering', level: 'Graduate', description: 'Specialization in aircraft design', createdBy: adminUser._id },

      // Arts Specializations
      { name: 'Creative Writing', field: 'Arts', level: 'Graduate', description: 'Specialization in creative writing', createdBy: adminUser._id },
      { name: 'Digital Journalism', field: 'Arts', level: 'Graduate', description: 'Specialization in digital media', createdBy: adminUser._id },
      { name: 'Clinical Psychology', field: 'Arts', level: 'Graduate', description: 'Specialization in clinical psychology', createdBy: adminUser._id },
      { name: 'Modern Literature', field: 'Arts', level: 'Graduate', description: 'Specialization in modern literature', createdBy: adminUser._id },
      { name: 'Ancient History', field: 'Arts', level: 'Graduate', description: 'Specialization in ancient civilizations', createdBy: adminUser._id },

      // Science Specializations
      { name: 'Theoretical Physics', field: 'Science', level: 'Graduate', description: 'Specialization in theoretical physics', createdBy: adminUser._id },
      { name: 'Organic Chemistry', field: 'Science', level: 'Graduate', description: 'Specialization in organic compounds', createdBy: adminUser._id },
      { name: 'Applied Mathematics', field: 'Science', level: 'Graduate', description: 'Specialization in applied mathematics', createdBy: adminUser._id },
      { name: 'Molecular Biology', field: 'Science', level: 'Graduate', description: 'Specialization in molecular biology', createdBy: adminUser._id }
    ];

    // Insert courses
    console.log(`Inserting ${courses.length} courses...`);
    await Course.insertMany(courses);
    console.log(`✅ Successfully inserted ${courses.length} courses`);

    // Insert specializations
    console.log(`Inserting ${specializations.length} specializations...`);
    await Specialization.insertMany(specializations);
    console.log(`✅ Successfully inserted ${specializations.length} specializations`);

    // Verify insertion
    const courseCount = await Course.countDocuments();
    const specializationCount = await Specialization.countDocuments();
    console.log(`✅ Total courses in database: ${courseCount}`);
    console.log(`✅ Total specializations in database: ${specializationCount}`);

    console.log('🎉 Courses and specializations seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding courses and specializations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCoursesAndSpecializations();

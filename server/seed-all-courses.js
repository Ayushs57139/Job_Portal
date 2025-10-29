const mongoose = require('mongoose');
const Course = require('./models/Course');
const Specialization = require('./models/Specialization');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const seedAllCoursesAndSpecializations = async () => {
  try {
    console.log('🌱 Starting comprehensive courses and specializations seeding...');

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

    // All Courses Data
    const allCourses = [
      // ITI Courses
      { name: 'ITI', category: 'Technical', level: 'Certificate', duration: '1-2 years', description: 'Industrial Training Institute', createdBy: adminUser._id },
      { name: 'Other', category: 'Other', level: 'Certificate', duration: '1-2 years', description: 'Other ITI courses', createdBy: adminUser._id },

      // Diploma Courses
      { name: 'Diploma', category: 'Technical', level: 'Diploma', duration: '3 years', description: 'Diploma courses', createdBy: adminUser._id },
      { name: 'D.Pharma', category: 'Medical', level: 'Diploma', duration: '2 years', description: 'Diploma in Pharmacy', createdBy: adminUser._id },
      { name: 'Advanced Diploma', category: 'Technical', level: 'Diploma', duration: '2-3 years', description: 'Advanced Diploma courses', createdBy: adminUser._id },

      // Bachelor Courses
      { name: 'B.A', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor of Arts', createdBy: adminUser._id },
      { name: 'B.Arch', category: 'Engineering', level: 'Graduate', duration: '5 years', description: 'Bachelor of Architecture', createdBy: adminUser._id },
      { name: 'B.A Hons.', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor of Arts Honours', createdBy: adminUser._id },
      { name: 'B.Com', category: 'Commerce', level: 'Graduate', duration: '3 years', description: 'Bachelor of Commerce', createdBy: adminUser._id },
      { name: 'B.Com Hons.', category: 'Commerce', level: 'Graduate', duration: '3 years', description: 'Bachelor of Commerce Honours', createdBy: adminUser._id },
      { name: 'B.Design', category: 'Arts', level: 'Graduate', duration: '4 years', description: 'Bachelor of Design', createdBy: adminUser._id },
      { name: 'B.Ed', category: 'Education', level: 'Graduate', duration: '2 years', description: 'Bachelor of Education', createdBy: adminUser._id },
      { name: 'B.EI.Ed', category: 'Education', level: 'Graduate', duration: '4 years', description: 'Bachelor of Elementary Education', createdBy: adminUser._id },
      { name: 'B.E/B.Tech', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor of Engineering/Technology', createdBy: adminUser._id },
      { name: 'B.F Tech', category: 'Engineering', level: 'Graduate', duration: '4 years', description: 'Bachelor of Fashion Technology', createdBy: adminUser._id },
      { name: 'B.Sc', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor of Science', createdBy: adminUser._id },
      { name: 'B.Sc Hons.', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor of Science Honours', createdBy: adminUser._id },
      { name: 'B.P.Ed', category: 'Education', level: 'Graduate', duration: '2 years', description: 'Bachelor of Physical Education', createdBy: adminUser._id },
      { name: 'B.U.M.S', category: 'Medical', level: 'Graduate', duration: '5.5 years', description: 'Bachelor of Unani Medicine and Surgery', createdBy: adminUser._id },
      { name: 'B.Voc', category: 'Technical', level: 'Graduate', duration: '3 years', description: 'Bachelor of Vocational Studies', createdBy: adminUser._id },
      { name: 'B.Pharma', category: 'Medical', level: 'Graduate', duration: '4 years', description: 'Bachelor of Pharmacy', createdBy: adminUser._id },
      { name: 'B.Pharma Hons.', category: 'Medical', level: 'Graduate', duration: '4 years', description: 'Bachelor of Pharmacy Honours', createdBy: adminUser._id },
      { name: 'Bachelor', category: 'Other', level: 'Graduate', duration: '3-4 years', description: 'General Bachelor degree', createdBy: adminUser._id },
      { name: 'BASc', category: 'Science', level: 'Graduate', duration: '3 years', description: 'Bachelor of Applied Science', createdBy: adminUser._id },
      { name: 'BAF', category: 'Commerce', level: 'Graduate', duration: '3 years', description: 'Bachelor of Accounting and Finance', createdBy: adminUser._id },
      { name: 'BAMS', category: 'Medical', level: 'Graduate', duration: '5.5 years', description: 'Bachelor of Ayurvedic Medicine and Surgery', createdBy: adminUser._id },
      { name: 'BBA', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Business Administration', createdBy: adminUser._id },
      { name: 'BBA Hons.', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Business Administration Honours', createdBy: adminUser._id },
      { name: 'BBM', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Business Management', createdBy: adminUser._id },
      { name: 'BBM Hons.', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Business Management Honours', createdBy: adminUser._id },
      { name: 'BBE', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Business Economics', createdBy: adminUser._id },
      { name: 'BCA', category: 'Technical', level: 'Graduate', duration: '3 years', description: 'Bachelor of Computer Applications', createdBy: adminUser._id },
      { name: 'BDS', category: 'Medical', level: 'Graduate', duration: '5 years', description: 'Bachelor of Dental Surgery', createdBy: adminUser._id },
      { name: 'BFA', category: 'Arts', level: 'Graduate', duration: '4 years', description: 'Bachelor of Fine Arts', createdBy: adminUser._id },
      { name: 'BHM', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Hotel Management', createdBy: adminUser._id },
      { name: 'BHMS', category: 'Medical', level: 'Graduate', duration: '5.5 years', description: 'Bachelor of Homeopathic Medicine and Surgery', createdBy: adminUser._id },
      { name: 'BHMCT', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Hotel Management and Catering Technology', createdBy: adminUser._id },
      { name: 'BPA', category: 'Arts', level: 'Graduate', duration: '3 years', description: 'Bachelor of Performing Arts', createdBy: adminUser._id },
      { name: 'BMS', category: 'Management', level: 'Graduate', duration: '3 years', description: 'Bachelor of Management Studies', createdBy: adminUser._id },
      { name: 'MBBS', category: 'Medical', level: 'Graduate', duration: '5.5 years', description: 'Bachelor of Medicine and Bachelor of Surgery', createdBy: adminUser._id },
      { name: 'LLB', category: 'Law', level: 'Graduate', duration: '3 years', description: 'Bachelor of Laws', createdBy: adminUser._id },
      { name: 'LLB Hons.', category: 'Law', level: 'Graduate', duration: '3 years', description: 'Bachelor of Laws Honours', createdBy: adminUser._id },
      { name: 'Pharma.D', category: 'Medical', level: 'Graduate', duration: '6 years', description: 'Doctor of Pharmacy', createdBy: adminUser._id },
      { name: 'BS', category: 'Science', level: 'Graduate', duration: '4 years', description: 'Bachelor of Science', createdBy: adminUser._id },
      { name: 'BVSC', category: 'Medical', level: 'Graduate', duration: '5 years', description: 'Bachelor of Veterinary Science', createdBy: adminUser._id },
      { name: 'Dual Degree (B.E/B.Tech + M.E/M.Tech)', category: 'Engineering', level: 'Graduate', duration: '5 years', description: 'Dual Degree Engineering', createdBy: adminUser._id },

      // Master Courses
      { name: 'Chartered Accountant (CA)', category: 'Commerce', level: 'Post Graduate', duration: '3-4 years', description: 'Chartered Accountant', createdBy: adminUser._id },
      { name: 'CS', category: 'Commerce', level: 'Post Graduate', duration: '2-3 years', description: 'Company Secretary', createdBy: adminUser._id },
      { name: 'DM', category: 'Medical', level: 'Post Graduate', duration: '3 years', description: 'Doctor of Medicine', createdBy: adminUser._id },
      { name: 'ICWA (CMA)', category: 'Commerce', level: 'Post Graduate', duration: '2-3 years', description: 'Cost and Management Accountant', createdBy: adminUser._id },
      { name: 'LLM', category: 'Law', level: 'Post Graduate', duration: '2 years', description: 'Master of Laws', createdBy: adminUser._id },
      { name: 'M.A', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'Master of Arts', createdBy: adminUser._id },
      { name: 'M.A Hons.', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'Master of Arts Honours', createdBy: adminUser._id },
      { name: 'M.Arch', category: 'Engineering', level: 'Post Graduate', duration: '2 years', description: 'Master of Architecture', createdBy: adminUser._id },
      { name: 'Master', category: 'Other', level: 'Post Graduate', duration: '2 years', description: 'General Master degree', createdBy: adminUser._id },
      { name: 'MBA', category: 'Management', level: 'Post Graduate', duration: '2 years', description: 'Master of Business Administration', createdBy: adminUser._id },
      { name: 'MBA Executive', category: 'Management', level: 'Post Graduate', duration: '1-2 years', description: 'Executive Master of Business Administration', createdBy: adminUser._id },
      { name: 'MCA', category: 'Technical', level: 'Post Graduate', duration: '3 years', description: 'Master of Computer Applications', createdBy: adminUser._id },
      { name: 'MCh', category: 'Medical', level: 'Post Graduate', duration: '3 years', description: 'Master of Chirurgiae', createdBy: adminUser._id },
      { name: 'M.Com', category: 'Commerce', level: 'Post Graduate', duration: '2 years', description: 'Master of Commerce', createdBy: adminUser._id },
      { name: 'MD', category: 'Medical', level: 'Post Graduate', duration: '3 years', description: 'Doctor of Medicine', createdBy: adminUser._id },
      { name: 'M.Des', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'Master of Design', createdBy: adminUser._id },
      { name: 'M.Ed', category: 'Education', level: 'Post Graduate', duration: '2 years', description: 'Master of Education', createdBy: adminUser._id },
      { name: 'M.E/M.Tech', category: 'Engineering', level: 'Post Graduate', duration: '2 years', description: 'Master of Engineering/Technology', createdBy: adminUser._id },
      { name: 'MFA', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'Master of Fine Arts', createdBy: adminUser._id },
      { name: 'M.Mus', category: 'Arts', level: 'Post Graduate', duration: '2 years', description: 'Master of Music', createdBy: adminUser._id },
      { name: 'M.Pharm', category: 'Medical', level: 'Post Graduate', duration: '2 years', description: 'Master of Pharmacy', createdBy: adminUser._id },
      { name: 'M.Plan', category: 'Engineering', level: 'Post Graduate', duration: '2 years', description: 'Master of Planning', createdBy: adminUser._id },
      { name: 'M.Sc', category: 'Science', level: 'Post Graduate', duration: '2 years', description: 'Master of Science', createdBy: adminUser._id },
      { name: 'M.Voc', category: 'Technical', level: 'Post Graduate', duration: '2 years', description: 'Master of Vocational Studies', createdBy: adminUser._id },
      { name: 'PG Diploma', category: 'Other', level: 'Post Graduate', duration: '1-2 years', description: 'Post Graduate Diploma', createdBy: adminUser._id },
      { name: 'PGDM', category: 'Management', level: 'Post Graduate', duration: '2 years', description: 'Post Graduate Diploma in Management', createdBy: adminUser._id },
      { name: 'PGP', category: 'Management', level: 'Post Graduate', duration: '1-2 years', description: 'Post Graduate Program', createdBy: adminUser._id },

      // Doctorate Courses
      { name: 'Doctorate/PhD', category: 'Other', level: 'Doctorate', duration: '3-5 years', description: 'Doctor of Philosophy', createdBy: adminUser._id },
      { name: 'M.Phil', category: 'Other', level: 'Doctorate', duration: '2 years', description: 'Master of Philosophy', createdBy: adminUser._id }
    ];

    // Insert courses
    console.log(`Inserting ${allCourses.length} courses...`);
    await Course.insertMany(allCourses);
    console.log(`✅ Successfully inserted ${allCourses.length} courses`);

    console.log('🎉 Comprehensive courses seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAllCoursesAndSpecializations();

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

    // All Specializations Data
    const allSpecializations = [
      // ITI Specializations
      { name: 'ITI', field: 'Engineering', level: 'Certificate', description: 'Industrial Training Institute', createdBy: adminUser._id },
      { name: 'Other', field: 'Other', level: 'Certificate', description: 'Other ITI specializations', createdBy: adminUser._id },
      { name: 'Electrical', field: 'Engineering', level: 'Certificate', description: 'Electrical specialization', createdBy: adminUser._id },
      { name: 'Electronics', field: 'Engineering', level: 'Certificate', description: 'Electronics specialization', createdBy: adminUser._id },
      { name: 'Fitter', field: 'Engineering', level: 'Certificate', description: 'Fitter specialization', createdBy: adminUser._id },
      { name: 'Wireman', field: 'Engineering', level: 'Certificate', description: 'Wireman specialization', createdBy: adminUser._id },
      { name: 'Diesel Mechanic', field: 'Engineering', level: 'Certificate', description: 'Diesel Mechanic specialization', createdBy: adminUser._id },
      { name: 'Mechanical', field: 'Engineering', level: 'Certificate', description: 'Mechanical specialization', createdBy: adminUser._id },
      { name: 'Electrician', field: 'Engineering', level: 'Certificate', description: 'Electrician specialization', createdBy: adminUser._id },
      { name: 'Mechanic Motor Vehicle', field: 'Engineering', level: 'Certificate', description: 'Motor Vehicle Mechanic specialization', createdBy: adminUser._id },
      { name: 'Draughtsman (Mechanical)', field: 'Engineering', level: 'Certificate', description: 'Mechanical Draughtsman specialization', createdBy: adminUser._id },
      { name: 'Draughtsman (Civil)', field: 'Engineering', level: 'Certificate', description: 'Civil Draughtsman specialization', createdBy: adminUser._id },
      { name: 'Tool & Die Maker', field: 'Engineering', level: 'Certificate', description: 'Tool & Die Maker specialization', createdBy: adminUser._id },
      { name: 'Mechanic Machine Tool Maintenance', field: 'Engineering', level: 'Certificate', description: 'Machine Tool Maintenance specialization', createdBy: adminUser._id },
      { name: 'Electronics Mechanic', field: 'Engineering', level: 'Certificate', description: 'Electronics Mechanic specialization', createdBy: adminUser._id },
      { name: 'Mechanic (Refrigeration & Air-Conditioning)', field: 'Engineering', level: 'Certificate', description: 'Refrigeration & AC Mechanic specialization', createdBy: adminUser._id },
      { name: 'Welder', field: 'Engineering', level: 'Certificate', description: 'Welder specialization', createdBy: adminUser._id },
      { name: 'COPA', field: 'Technology', level: 'Certificate', description: 'Computer Operator and Programming Assistant', createdBy: adminUser._id },
      { name: 'Stenographer', field: 'Other', level: 'Certificate', description: 'Stenographer specialization', createdBy: adminUser._id },
      { name: 'Hair & Skin Care', field: 'Other', level: 'Certificate', description: 'Hair & Skin Care specialization', createdBy: adminUser._id },
      { name: 'Secretarial Practice', field: 'Other', level: 'Certificate', description: 'Secretarial Practice specialization', createdBy: adminUser._id },
      { name: 'Dress Making', field: 'Other', level: 'Certificate', description: 'Dress Making specialization', createdBy: adminUser._id },
      { name: 'Sewing Technology', field: 'Other', level: 'Certificate', description: 'Sewing Technology specialization', createdBy: adminUser._id },
      { name: 'Plumber', field: 'Engineering', level: 'Certificate', description: 'Plumber specialization', createdBy: adminUser._id },
      { name: 'Painter', field: 'Other', level: 'Certificate', description: 'Painter specialization', createdBy: adminUser._id },
      { name: 'Mechanic Two and Three Wheeler', field: 'Engineering', level: 'Certificate', description: 'Two and Three Wheeler Mechanic specialization', createdBy: adminUser._id },

      // Diploma Specializations
      { name: 'Diploma', field: 'Engineering', level: 'Graduate', description: 'Diploma specialization', createdBy: adminUser._id },
      { name: 'D.Pharma', field: 'Medicine', level: 'Graduate', description: 'Diploma in Pharmacy', createdBy: adminUser._id },
      { name: 'Advanced Diploma', field: 'Engineering', level: 'Graduate', description: 'Advanced Diploma specialization', createdBy: adminUser._id },
      { name: 'Mechanical Engineering', field: 'Engineering', level: 'Graduate', description: 'Mechanical Engineering specialization', createdBy: adminUser._id },
      { name: 'Civil Engineering', field: 'Engineering', level: 'Graduate', description: 'Civil Engineering specialization', createdBy: adminUser._id },
      { name: 'Electrical Engineering', field: 'Engineering', level: 'Graduate', description: 'Electrical Engineering specialization', createdBy: adminUser._id },
      { name: 'Computer Science & Engineering', field: 'Engineering', level: 'Graduate', description: 'Computer Science & Engineering specialization', createdBy: adminUser._id },
      { name: 'Electronics & Communication Engineering', field: 'Engineering', level: 'Graduate', description: 'Electronics & Communication Engineering specialization', createdBy: adminUser._id },
      { name: 'Automobile Engineering', field: 'Engineering', level: 'Graduate', description: 'Automobile Engineering specialization', createdBy: adminUser._id },
      { name: 'Information Technology (IT)', field: 'Technology', level: 'Graduate', description: 'Information Technology specialization', createdBy: adminUser._id },
      { name: 'Mechatronics', field: 'Engineering', level: 'Graduate', description: 'Mechatronics specialization', createdBy: adminUser._id },
      { name: 'Aeronautical Engineering', field: 'Engineering', level: 'Graduate', description: 'Aeronautical Engineering specialization', createdBy: adminUser._id },
      { name: 'Mining Engineering', field: 'Engineering', level: 'Graduate', description: 'Mining Engineering specialization', createdBy: adminUser._id },
      { name: 'Medical Laboratory Technology (DMLT)', field: 'Medicine', level: 'Graduate', description: 'Medical Laboratory Technology specialization', createdBy: adminUser._id },
      { name: 'Radiology & Imaging Technology', field: 'Medicine', level: 'Graduate', description: 'Radiology & Imaging Technology specialization', createdBy: adminUser._id },
      { name: 'Nursing', field: 'Medicine', level: 'Graduate', description: 'Nursing specialization', createdBy: adminUser._id },
      { name: 'Pharmacy', field: 'Medicine', level: 'Graduate', description: 'Pharmacy specialization', createdBy: adminUser._id },
      { name: 'Physiotherapy', field: 'Medicine', level: 'Graduate', description: 'Physiotherapy specialization', createdBy: adminUser._id },
      { name: 'Optometry', field: 'Medicine', level: 'Graduate', description: 'Optometry specialization', createdBy: adminUser._id },
      { name: 'Veterinary Science', field: 'Medicine', level: 'Graduate', description: 'Veterinary Science specialization', createdBy: adminUser._id },
      { name: 'Ayurveda Pharmacy', field: 'Medicine', level: 'Graduate', description: 'Ayurveda Pharmacy specialization', createdBy: adminUser._id },
      { name: 'Accounting & Finance', field: 'Business', level: 'Graduate', description: 'Accounting & Finance specialization', createdBy: adminUser._id },
      { name: 'Business Administration', field: 'Business', level: 'Graduate', description: 'Business Administration specialization', createdBy: adminUser._id },
      { name: 'Banking & Insurance', field: 'Business', level: 'Graduate', description: 'Banking & Insurance specialization', createdBy: adminUser._id },
      { name: 'Digital Marketing', field: 'Business', level: 'Graduate', description: 'Digital Marketing specialization', createdBy: adminUser._id },
      { name: 'Retail Management', field: 'Business', level: 'Graduate', description: 'Retail Management specialization', createdBy: adminUser._id },
      { name: 'Taxation', field: 'Business', level: 'Graduate', description: 'Taxation specialization', createdBy: adminUser._id },
      { name: 'Financial Management', field: 'Business', level: 'Graduate', description: 'Financial Management specialization', createdBy: adminUser._id },
      { name: 'E-commerce', field: 'Business', level: 'Graduate', description: 'E-commerce specialization', createdBy: adminUser._id },
      { name: 'Office Management', field: 'Business', level: 'Graduate', description: 'Office Management specialization', createdBy: adminUser._id },
      { name: 'Fashion Designing', field: 'Arts', level: 'Graduate', description: 'Fashion Designing specialization', createdBy: adminUser._id },
      { name: 'Interior Designing', field: 'Arts', level: 'Graduate', description: 'Interior Designing specialization', createdBy: adminUser._id },
      { name: 'Graphic Designing', field: 'Arts', level: 'Graduate', description: 'Graphic Designing specialization', createdBy: adminUser._id },
      { name: 'Animation & Multimedia', field: 'Arts', level: 'Graduate', description: 'Animation & Multimedia specialization', createdBy: adminUser._id },
      { name: 'Journalism & Mass Communication', field: 'Arts', level: 'Graduate', description: 'Journalism & Mass Communication specialization', createdBy: adminUser._id },
      { name: 'Photography', field: 'Arts', level: 'Graduate', description: 'Photography specialization', createdBy: adminUser._id },
      { name: 'Event Management', field: 'Business', level: 'Graduate', description: 'Event Management specialization', createdBy: adminUser._id },
      { name: 'Hotel Management', field: 'Business', level: 'Graduate', description: 'Hotel Management specialization', createdBy: adminUser._id },
      { name: 'Fine Arts', field: 'Arts', level: 'Graduate', description: 'Fine Arts specialization', createdBy: adminUser._id },
      { name: 'Travel & Tourism', field: 'Business', level: 'Graduate', description: 'Travel & Tourism specialization', createdBy: adminUser._id },
      { name: 'Biotechnology', field: 'Science', level: 'Graduate', description: 'Biotechnology specialization', createdBy: adminUser._id },
      { name: 'Microbiology', field: 'Science', level: 'Graduate', description: 'Microbiology specialization', createdBy: adminUser._id },
      { name: 'Environmental Science', field: 'Science', level: 'Graduate', description: 'Environmental Science specialization', createdBy: adminUser._id },
      { name: 'Forensic Science', field: 'Science', level: 'Graduate', description: 'Forensic Science specialization', createdBy: adminUser._id },
      { name: 'Food Technology', field: 'Science', level: 'Graduate', description: 'Food Technology specialization', createdBy: adminUser._id },
      { name: 'Clinical Research', field: 'Medicine', level: 'Graduate', description: 'Clinical Research specialization', createdBy: adminUser._id },
      { name: 'Education (Special Education, Early Childhood)', field: 'Education', level: 'Graduate', description: 'Special Education specialization', createdBy: adminUser._id },
      { name: 'Social Work', field: 'Arts', level: 'Graduate', description: 'Social Work specialization', createdBy: adminUser._id },
      { name: 'Public Administration', field: 'Business', level: 'Graduate', description: 'Public Administration specialization', createdBy: adminUser._id },
      { name: 'Psychology', field: 'Arts', level: 'Graduate', description: 'Psychology specialization', createdBy: adminUser._id },
      { name: 'Library & Information Science', field: 'Arts', level: 'Graduate', description: 'Library & Information Science specialization', createdBy: adminUser._id },
      { name: 'Dairy Technology', field: 'Science', level: 'Graduate', description: 'Dairy Technology specialization', createdBy: adminUser._id },
      { name: 'Food Processing', field: 'Science', level: 'Graduate', description: 'Food Processing specialization', createdBy: adminUser._id },
      { name: 'Industrial Safety', field: 'Engineering', level: 'Graduate', description: 'Industrial Safety specialization', createdBy: adminUser._id },
      { name: 'Fire & Safety Engineering', field: 'Engineering', level: 'Graduate', description: 'Fire & Safety Engineering specialization', createdBy: adminUser._id },
      { name: 'Applied Art', field: 'Arts', level: 'Graduate', description: 'Applied Art specialization', createdBy: adminUser._id },
      { name: 'Drawing & Painting', field: 'Arts', level: 'Graduate', description: 'Drawing & Painting specialization', createdBy: adminUser._id },
      { name: 'Sculpture & Modelling', field: 'Arts', level: 'Graduate', description: 'Sculpture & Modelling specialization', createdBy: adminUser._id },
      { name: 'Textile Designing', field: 'Arts', level: 'Graduate', description: 'Textile Designing specialization', createdBy: adminUser._id },
      { name: 'Aerospace Engineering', field: 'Engineering', level: 'Graduate', description: 'Aerospace Engineering specialization', createdBy: adminUser._id },
      { name: 'Industrial Engineering', field: 'Engineering', level: 'Graduate', description: 'Industrial Engineering specialization', createdBy: adminUser._id },
      { name: 'Information Engineering', field: 'Engineering', level: 'Graduate', description: 'Information Engineering specialization', createdBy: adminUser._id },
      { name: 'Chemical Engineering', field: 'Engineering', level: 'Graduate', description: 'Chemical Engineering specialization', createdBy: adminUser._id },
      { name: 'Instrumentation Engineering', field: 'Engineering', level: 'Graduate', description: 'Instrumentation Engineering specialization', createdBy: adminUser._id },
      { name: 'Marine Engineering', field: 'Engineering', level: 'Graduate', description: 'Marine Engineering specialization', createdBy: adminUser._id },
      { name: 'Computer Engineering', field: 'Engineering', level: 'Graduate', description: 'Computer Engineering specialization', createdBy: adminUser._id },
      { name: 'Petroleum Engineering', field: 'Engineering', level: 'Graduate', description: 'Petroleum Engineering specialization', createdBy: adminUser._id },
      { name: 'Electronics Engineering', field: 'Engineering', level: 'Graduate', description: 'Electronics Engineering specialization', createdBy: adminUser._id },
      { name: 'Textile Engineering', field: 'Engineering', level: 'Graduate', description: 'Textile Engineering specialization', createdBy: adminUser._id },
      { name: 'Geographic Information Systems (GIS)', field: 'Technology', level: 'Graduate', description: 'GIS specialization', createdBy: adminUser._id },
      { name: 'Paint Technology', field: 'Engineering', level: 'Graduate', description: 'Paint Technology specialization', createdBy: adminUser._id },
      { name: 'Elementary Education', field: 'Education', level: 'Graduate', description: 'Elementary Education specialization', createdBy: adminUser._id },
      { name: 'Architecture', field: 'Engineering', level: 'Graduate', description: 'Architecture specialization', createdBy: adminUser._id },
      { name: 'Chemical Fertilizer', field: 'Engineering', level: 'Graduate', description: 'Chemical Fertilizer specialization', createdBy: adminUser._id },
      { name: 'Metallurgical Engineering', field: 'Engineering', level: 'Graduate', description: 'Metallurgical Engineering specialization', createdBy: adminUser._id },
      { name: 'IT Smart', field: 'Technology', level: 'Graduate', description: 'IT Smart specialization', createdBy: adminUser._id }
    ];

    // Insert specializations
    console.log(`Inserting ${allSpecializations.length} specializations...`);
    await Specialization.insertMany(allSpecializations);
    console.log(`✅ Successfully inserted ${allSpecializations.length} specializations`);

    // Verify insertion
    const courseCount = await Course.countDocuments();
    const specializationCount = await Specialization.countDocuments();
    console.log(`✅ Total courses in database: ${courseCount}`);
    console.log(`✅ Total specializations in database: ${specializationCount}`);

    console.log('🎉 Comprehensive courses and specializations seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding courses and specializations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAllCoursesAndSpecializations();

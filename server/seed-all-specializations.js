const mongoose = require('mongoose');
const Course = require('./models/Course');
const Specialization = require('./models/Specialization');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const seedAllSpecializations = async () => {
  try {
    console.log('🌱 Starting comprehensive specializations seeding...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ userType: 'superadmin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing specializations data
    await Specialization.deleteMany({});
    console.log('🗑️ Cleared existing specializations data');

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

    console.log('🎉 Comprehensive specializations seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding specializations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAllSpecializations();

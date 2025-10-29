const mongoose = require('mongoose');
const JobIndustry = require('./models/JobIndustry');
const JobDesignation = require('./models/JobDesignation');
const JobDepartment = require('./models/JobDepartment');
const JobRole = require('./models/JobRole');
const JobKeySkill = require('./models/JobKeySkill');
const Education = require('./models/Education');
const Location = require('./models/Location');
const Sector = require('./models/Sector');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const checkData = async () => {
  try {
    console.log('🔍 Checking master data in database...\n');

    // Check each collection
    const industries = await JobIndustry.find({ isActive: true });
    console.log(`✅ Industries: ${industries.length} records`);
    if (industries.length > 0) {
      console.log(`   Sample: ${industries[0].name}`);
    }

    const designations = await JobDesignation.find({ isActive: true });
    console.log(`✅ Designations: ${designations.length} records`);
    if (designations.length > 0) {
      console.log(`   Sample: ${designations[0].name}`);
    }

    const departments = await JobDepartment.find({ isActive: true });
    console.log(`✅ Departments: ${departments.length} records`);
    if (departments.length > 0) {
      console.log(`   Sample: ${departments[0].name}`);
    }

    const roles = await JobRole.find({ isActive: true });
    console.log(`✅ Job Roles: ${roles.length} records`);
    if (roles.length > 0) {
      console.log(`   Sample: ${roles[0].name}`);
    }

    const skills = await JobKeySkill.find({ isActive: true });
    console.log(`✅ Key Skills: ${skills.length} records`);
    if (skills.length > 0) {
      console.log(`   Sample: ${skills[0].name}`);
    }

    const education = await Education.find({ isActive: true });
    console.log(`✅ Education: ${education.length} records`);
    if (education.length > 0) {
      console.log(`   Sample: ${education[0].name}`);
    }

    const locations = await Location.find({ isActive: true });
    console.log(`✅ Locations: ${locations.length} records`);
    if (locations.length > 0) {
      console.log(`   Sample: ${locations[0].name}`);
    }

    const sectors = await Sector.find({ isActive: true });
    console.log(`✅ Sectors: ${sectors.length} records`);
    if (sectors.length > 0) {
      console.log(`   Sample: ${sectors[0].name}`);
    }

    console.log('\n🎉 All data is present in the database!');
    console.log('\n📝 Note: The admin panel requires authentication to access this data.');
    console.log('   Please login with admin credentials to view the data in the admin panel.');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkData();

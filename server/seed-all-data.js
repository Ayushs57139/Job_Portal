const mongoose = require('mongoose');
const { createCustomFields } = require('./seed-experience-data');
const { createKeySkillsField } = require('./seed-key-skills');
const { createJobTitlesField } = require('./seed-job-titles');
const { createJobRolesField } = require('./seed-job-roles');
const { createIndustriesField } = require('./seed-industries');
const { createDetailedIndustriesField } = require('./seed-detailed-industries');
const { createCertificationsField } = require('./seed-certifications');
const { createDepartmentsField } = require('./seed-departments');

// Function to seed all data
async function seedAllData() {
  try {
    console.log('🚀 Starting comprehensive data seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala');
    console.log('✅ Connected to MongoDB\n');

    // Seed experience fields
    console.log('📋 Seeding experience fields...');
    await createCustomFields();
    console.log('✅ Experience fields seeded\n');

    // Seed key skills
    console.log('🛠️ Seeding key skills...');
    await createKeySkillsField();
    console.log('✅ Key skills seeded\n');

    // Seed job titles
    console.log('💼 Seeding job titles...');
    await createJobTitlesField();
    console.log('✅ Job titles seeded\n');

    // Seed job roles
    console.log('👔 Seeding job roles...');
    await createJobRolesField();
    console.log('✅ Job roles seeded\n');

    // Seed industries
    console.log('🏢 Seeding industries...');
    await createIndustriesField();
    console.log('✅ Industries seeded\n');

    // Seed detailed industries
    console.log('🏭 Seeding detailed industries...');
    await createDetailedIndustriesField();
    console.log('✅ Detailed industries seeded\n');

    // Seed certifications
    console.log('🎓 Seeding certifications...');
    await createCertificationsField();
    console.log('✅ Certifications seeded\n');

    // Seed departments
    console.log('🏢 Seeding departments...');
    await createDepartmentsField();
    console.log('✅ Departments seeded\n');

    console.log('🎉 All data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • Experience fields: 20+ fields');
    console.log('   • Key skills: 1,035+ skills');
    console.log('   • Job titles: 234+ titles');
    console.log('   • Job roles: 409+ specific roles');
    console.log('   • Industries: 307+ industries');
    console.log('   • Detailed industries: 49 main + 669 sub-industries');
    console.log('   • Certifications: 160+ professional certifications');
    console.log('   • Departments: 51 main + 1,055 sub-departments');
    console.log('\n✨ Your job portal is now ready with comprehensive data!');

  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log('\n🎯 Data seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAllData };

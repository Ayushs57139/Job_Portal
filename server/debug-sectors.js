const mongoose = require('mongoose');
const Sector = require('./models/Sector');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const debugSectors = async () => {
  try {
    console.log('🔍 Debugging sectors seeding...\n');

    // Check all sectors
    const allSectors = await Sector.find({});
    console.log(`Total sectors in database: ${allSectors.length}`);
    
    if (allSectors.length > 0) {
      console.log('\nAll sectors:');
      allSectors.forEach((sector, index) => {
        console.log(`${index + 1}. ${sector.name} (${sector.industry})`);
      });
    }

    // Try to create a few test sectors manually
    console.log('\nCreating test sectors manually...');
    const testSectors = [
      { name: 'Software Development', industry: 'Information Technology', description: 'Custom software development' },
      { name: 'IT Services', industry: 'Information Technology', description: 'IT consulting and support' },
      { name: 'Healthcare Services', industry: 'Healthcare & Medical', description: 'Medical services' }
    ];

    for (const sector of testSectors) {
      try {
        const newSector = new Sector(sector);
        await newSector.save();
        console.log(`✅ Created: ${sector.name}`);
      } catch (error) {
        console.log(`❌ Error creating ${sector.name}:`, error.message);
      }
    }

    // Check again
    const finalSectors = await Sector.find({});
    console.log(`\nFinal sectors count: ${finalSectors.length}`);

  } catch (error) {
    console.error('❌ Error debugging sectors:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugSectors();

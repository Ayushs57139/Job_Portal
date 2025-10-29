const mongoose = require('mongoose');
const Sector = require('./models/Sector');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

const checkSectors = async () => {
  try {
    console.log('🔍 Checking sectors in database...\n');

    // Check sectors collection directly
    const sectors = await Sector.find({});
    console.log(`✅ Sectors: ${sectors.length} records`);
    
    if (sectors.length > 0) {
      console.log('Sample sectors:');
      sectors.slice(0, 5).forEach(sector => {
        console.log(`   - ${sector.name} (${sector.industry})`);
      });
    } else {
      console.log('❌ No sectors found');
      
      // Try to create a test sector
      console.log('Creating test sector...');
      const testSector = new Sector({
        name: 'Test Sector',
        industry: 'Test Industry',
        description: 'Test description'
      });
      
      await testSector.save();
      console.log('✅ Test sector created successfully');
      
      // Check again
      const newSectors = await Sector.find({});
      console.log(`✅ Sectors after test: ${newSectors.length} records`);
    }

  } catch (error) {
    console.error('❌ Error checking sectors:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkSectors();

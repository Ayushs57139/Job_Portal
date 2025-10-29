const mongoose = require('mongoose');
const WebsiteLogo = require('./models/WebsiteLogo');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobwala', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedDefaultLogo() {
  try {
    console.log('🌱 Seeding default logo configuration...');

    // Check if default logo already exists
    const existingLogo = await WebsiteLogo.findOne({ isDefault: true });
    if (existingLogo) {
      console.log('✅ Default logo already exists:', existingLogo.name);
      return;
    }

    // Create default logo configuration
    const defaultLogo = new WebsiteLogo({
      name: 'Default Freejobwala Logo',
      description: 'Default text-based logo for Freejobwala website',
      logoType: 'text',
      textLogo: {
        primaryText: 'Freejob',
        secondaryText: 'wala',
        primaryColor: '#1E88E5',
        secondaryColor: '#ff6b35',
        tertiaryColor: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'inherit',
        showSwoosh: true,
        swooshColor: 'linear-gradient(90deg, #1E88E5, #ff6b35)'
      },
      isActive: true,
      isDefault: true,
      uploadedBy: new mongoose.Types.ObjectId(), // Placeholder ObjectId
      version: 1
    });

    await defaultLogo.save();
    console.log('✅ Default logo created successfully:', defaultLogo.name);
    console.log('📋 Logo details:');
    console.log('   - Type:', defaultLogo.logoType);
    console.log('   - Primary Text:', defaultLogo.textLogo.primaryText);
    console.log('   - Secondary Text:', defaultLogo.textLogo.secondaryText);
    console.log('   - Primary Color:', defaultLogo.textLogo.primaryColor);
    console.log('   - Secondary Color:', defaultLogo.textLogo.secondaryColor);
    console.log('   - Font Size:', defaultLogo.textLogo.fontSize);
    console.log('   - Show Swoosh:', defaultLogo.textLogo.showSwoosh);

  } catch (error) {
    console.error('❌ Error seeding default logo:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedDefaultLogo();

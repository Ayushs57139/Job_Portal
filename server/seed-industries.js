const mongoose = require('mongoose');
const Industry = require('./models/Industry');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0';

async function seedIndustries() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
    });
    
    console.log('Connected to MongoDB');
    
    // Seed industries
    const success = await Industry.seedIndustries();
    
    if (success) {
      console.log('✅ Industries seeded successfully!');
    } else {
      console.log('❌ Failed to seed industries');
    }
    
  } catch (error) {
    console.error('Error seeding industries:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seeding function
seedIndustries();
const mongoose = require('mongoose');

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 seconds

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayushs57139_db_user:6atpoj3C0h4VRvGJ@cluster0.vy1jecc.mongodb.net/jobwala?retryWrites=true&w=majority&appName=Cluster0');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    reconnectAttempts = 0; // Reset counter on successful connection
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected at:', new Date().toISOString());
      attemptReconnect();
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully at:', new Date().toISOString());
      reconnectAttempts = 0;
    });

  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Error details:', error.message);
    
    // Attempt reconnection if connection fails initially
    setTimeout(() => {
      attemptReconnect();
    }, RECONNECT_DELAY);
  }
};

const attemptReconnect = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached. Exiting process...');
    process.exit(1);
  }

  reconnectAttempts++;
  console.log(`Attempting to reconnect to MongoDB (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  try {
    await connectDB();
  } catch (error) {
    console.error(`Reconnection attempt ${reconnectAttempts} failed:`, error.message);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        attemptReconnect();
      }, RECONNECT_DELAY);
    } else {
      console.error('All reconnection attempts exhausted. Exiting...');
      process.exit(1);
    }
  }
};

module.exports = connectDB;

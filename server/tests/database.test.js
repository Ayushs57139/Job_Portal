const mongoose = require('mongoose');
const connectDB = require('../config/database');

describe('Database Connection Tests', () => {
  test('Should connect to MongoDB', async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    
    await mongoose.connect(mongoUri);
    
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    
    await mongoose.connection.close();
  });

  test('Should handle connection errors gracefully', async () => {
    const invalidUri = 'mongodb://invalid-host:27017/invalid-db';
    
    try {
      await mongoose.connect(invalidUri, {
        serverSelectionTimeoutMS: 2000
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('Should get connection status', () => {
    const getConnectionStatus = require('../config/database').getConnectionStatus;
    
    if (getConnectionStatus) {
      const status = getConnectionStatus();
      expect(status).toHaveProperty('state');
      expect(status).toHaveProperty('isConnected');
    }
  });
});

describe('Model Validation Tests', () => {
  const User = require('../models/User');
  const Job = require('../models/Job');
  const Application = require('../models/Application');

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('User model should require firstName', async () => {
    const user = new User({
      lastName: 'Doe',
      email: 'test@test.com',
      password: 'password123'
    });

    await expect(user.save()).rejects.toThrow();
  });

  test('User model should require email', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    await expect(user.save()).rejects.toThrow();
  });

  test('User model should require password', async () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com'
    });

    await expect(user.save()).rejects.toThrow();
  });

  test('Job model should require title', async () => {
    const job = new Job({
      description: 'Test description',
      company: {
        name: 'Test Company',
        type: 'Corporate',
        totalEmployees: '51-100'
      }
    });

    await expect(job.save()).rejects.toThrow();
  });

  test('Job model should require company name', async () => {
    const job = new Job({
      title: 'Test Job',
      description: 'Test description'
    });

    await expect(job.save()).rejects.toThrow();
  });

  test('Application model should require user, job, and employer', async () => {
    const application = new Application({
      fullName: 'John Doe',
      email: 'test@test.com',
      mobileNumber: '9876543210'
    });

    await expect(application.save()).rejects.toThrow();
  });
});


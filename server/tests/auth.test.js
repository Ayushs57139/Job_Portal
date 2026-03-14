const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        phone: '9876543210',
        userType: 'jobseeker'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('john@test.com');
    });

    test('Should fail with duplicate email', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        phone: '9876543210',
        userType: 'jobseeker',
        userId: 'JW12345678'
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'password123',
          phone: '9876543211',
          userType: 'jobseeker'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John'
          // Missing other required fields
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: '123', // Too short
          phone: '9876543210',
          userType: 'jobseeker'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        phone: '9876543210',
        userType: 'jobseeker',
        userId: 'JW12345678',
        isActive: true
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('Should fail with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        phone: '9876543210',
        userType: 'jobseeker',
        userId: 'JW12345678',
        isActive: true
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with inactive account', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        phone: '9876543210',
        userType: 'jobseeker',
        userId: 'JW12345678',
        isActive: false // Inactive account
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/employer/login', () => {
    test('Should login employer with userId', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const employer = new User({
        firstName: 'Employer',
        lastName: 'Test',
        email: 'employer@test.com',
        password: hashedPassword,
        phone: '9876543211',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345679',
        isActive: true
      });
      await employer.save();

      const response = await request(app)
        .post('/api/employer/login')
        .send({
          loginId: 'JW12345679',
          password: 'password123',
          userType: 'employer',
          employerType: 'company'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.userType).toBe('employer');
    });

    test('Should login employer with email', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const employer = new User({
        firstName: 'Employer',
        lastName: 'Test',
        email: 'employer@test.com',
        password: hashedPassword,
        phone: '9876543211',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345679',
        isActive: true
      });
      await employer.save();

      const response = await request(app)
        .post('/api/employer/login')
        .send({
          loginId: 'employer@test.com',
          password: 'password123',
          userType: 'employer',
          employerType: 'company'
        });

      expect(response.status).toBe(200);
    });

    test('Should fail with wrong employer type', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const employer = new User({
        firstName: 'Employer',
        lastName: 'Test',
        email: 'employer@test.com',
        password: hashedPassword,
        phone: '9876543211',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345679',
        isActive: true
      });
      await employer.save();

      const response = await request(app)
        .post('/api/employer/login')
        .send({
          loginId: 'employer@test.com',
          password: 'password123',
          userType: 'employer',
          employerType: 'consultancy' // Wrong type
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    test('Should get current user profile', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        phone: '9876543210',
        userType: 'jobseeker',
        userId: 'JW12345678',
        isActive: true
      });
      await user.save();

      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('john@test.com');
    });

    test('Should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});


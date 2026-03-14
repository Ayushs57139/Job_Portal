const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

describe('Admin API Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);

    // Create admin user
    adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      phone: '9876543210',
      userType: 'admin',
      userId: 'JW99999999',
      isActive: true
    });
    await adminUser.save();

    // Create regular user
    regularUser = new User({
      firstName: 'Regular',
      lastName: 'User',
      email: 'regular@test.com',
      password: 'password123',
      phone: '9876543211',
      userType: 'jobseeker',
      userId: 'JW12345678',
      isActive: true
    });
    await regularUser.save();

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'test-secret');
    userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Job.deleteMany({});
    await Application.deleteMany({});
  });

  describe('GET /api/admin/dashboard', () => {
    test('Should get admin dashboard data', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
    });

    test('Should fail for non-admin user', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/users', () => {
    test('Should get all users (admin)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    test('Should filter users by userType', async () => {
      const response = await request(app)
        .get('/api/admin/users?userType=jobseeker')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test('Should fail for non-admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/admin/users/:id/status', () => {
    test('Should update user status (admin)', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.user.isActive).toBe(false);
    });

    test('Should fail for non-admin', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUser._id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/jobs', () => {
    test('Should get all jobs (admin)', async () => {
      const employer = new User({
        firstName: 'Employer',
        lastName: 'Test',
        email: 'employer@test.com',
        password: 'password123',
        phone: '9876543212',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345679',
        isActive: true
      });
      await employer.save();

      const job = new Job({
        title: 'Test Job',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: employer._id,
        isActive: true
      });
      await job.save();

      const response = await request(app)
        .get('/api/admin/jobs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobs');
    });
  });

  describe('GET /api/admin/applications', () => {
    test('Should get all applications (admin)', async () => {
      const employer = new User({
        firstName: 'Employer',
        lastName: 'Test',
        email: 'employer@test.com',
        password: 'password123',
        phone: '9876543212',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345679',
        isActive: true
      });
      await employer.save();

      const job = new Job({
        title: 'Test Job',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: employer._id,
        isActive: true
      });
      await job.save();

      const application = new Application({
        user: regularUser._id,
        job: job._id,
        employer: employer._id,
        fullName: 'Test User',
        email: regularUser.email,
        mobileNumber: '9876543211',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        maritalStatus: 'Single',
        currentLocation: 'Mumbai',
        experienceLevel: 'Fresher',
        jobStatus: 'Not Working',
        jobProfileDescription: 'Test description',
        educationLevel: 'Graduate',
        course: 'Engineering'
      });
      await application.save();

      const response = await request(app)
        .get('/api/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applications');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    test('Should delete user (admin)', async () => {
      const userToDelete = new User({
        firstName: 'Delete',
        lastName: 'User',
        email: 'delete@test.com',
        password: 'password123',
        phone: '9876543213',
        userType: 'jobseeker',
        userId: 'JW12345680',
        isActive: true
      });
      await userToDelete.save();

      const response = await request(app)
        .delete(`/api/admin/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify user is deleted
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    test('Should fail for non-admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});


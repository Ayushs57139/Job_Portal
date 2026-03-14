const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

describe('Applications API Tests', () => {
  let testUser;
  let testEmployer;
  let testJob;
  let authToken;
  let employerToken;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);

    // Create test user (jobseeker)
    testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@test.com',
      password: 'password123',
      phone: '9876543210',
      userType: 'jobseeker',
      userId: 'JW12345678',
      isActive: true
    });
    await testUser.save();

    // Create test employer
    testEmployer = new User({
      firstName: 'Test',
      lastName: 'Employer',
      email: 'testemployer@test.com',
      password: 'password123',
      phone: '9876543211',
      userType: 'employer',
      employerType: 'company',
      userId: 'JW12345679',
      isActive: true
    });
    await testEmployer.save();

    // Create test job
    testJob = new Job({
      title: 'Test Job',
      description: 'Test job description',
      company: {
        name: 'Test Company',
        type: 'Corporate',
        totalEmployees: '51-100'
      },
      location: 'Test Location',
      salary: {
        min: 10000,
        max: 20000,
        currency: 'INR'
      },
      postedBy: testEmployer._id,
      isActive: true
    });
    await testJob.save();

    // Generate auth tokens
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-secret');
    employerToken = jwt.sign({ id: testEmployer._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // Clean up test data
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean applications before each test
    await Application.deleteMany({});
  });

  describe('POST /api/applications/direct', () => {
    test('Should submit direct application successfully', async () => {
      const response = await request(app)
        .post('/api/applications/direct')
        .send({
          fullName: 'John Doe',
          email: 'johndoe@test.com',
          mobileNumber: '9876543212',
          jobId: testJob._id.toString(),
          currentLocation: 'Mumbai',
          jobProfileDescription: 'Test description',
          educationLevel: 'Graduate',
          course: 'Engineering',
          keySkills: ['JavaScript', 'Node.js']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('user');
    });

    test('Should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/applications/direct')
        .send({
          fullName: 'John Doe',
          // Missing email, mobileNumber, jobId
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should fail with invalid job ID', async () => {
      const response = await request(app)
        .post('/api/applications/direct')
        .send({
          fullName: 'John Doe',
          email: 'johndoe@test.com',
          mobileNumber: '9876543212',
          jobId: new mongoose.Types.ObjectId().toString(),
          currentLocation: 'Mumbai',
          jobProfileDescription: 'Test description',
          educationLevel: 'Graduate',
          course: 'Engineering'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    test('Should prevent duplicate applications', async () => {
      // Create first application
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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

      // Try to create duplicate
      const response = await request(app)
        .post('/api/applications/direct')
        .send({
          fullName: 'John Doe',
          email: testUser.email,
          mobileNumber: '9876543212',
          jobId: testJob._id.toString(),
          currentLocation: 'Mumbai',
          jobProfileDescription: 'Test description',
          educationLevel: 'Graduate',
          course: 'Engineering'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already applied');
    });
  });

  describe('POST /api/applications', () => {
    test('Should submit application with authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fullName: 'John Doe',
          email: testUser.email,
          mobileNumber: '9876543212',
          jobId: testJob._id.toString(),
          currentLocation: 'Mumbai',
          jobProfileDescription: 'Test description',
          educationLevel: 'Graduate',
          course: 'Engineering',
          keySkills: ['JavaScript', 'Node.js']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('application');
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          fullName: 'John Doe',
          email: 'test@test.com',
          mobileNumber: '9876543212',
          jobId: testJob._id.toString()
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/applications/my-applications', () => {
    test('Should get user applications', async () => {
      // Create test application
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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
        .get('/api/applications/my-applications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('applications');
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/applications/my-applications');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/applications/job/:jobId', () => {
    test('Should get applications for a job (employer)', async () => {
      // Create test application
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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
        .get(`/api/applications/job/${testJob._id}`)
        .set('Authorization', `Bearer ${employerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applications');
      expect(Array.isArray(response.body.applications)).toBe(true);
    });

    test('Should fail for unauthorized user', async () => {
      const response = await request(app)
        .get(`/api/applications/job/${testJob._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/applications/:id/status', () => {
    test('Should update application status', async () => {
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'Male',
        maritalStatus: 'Single',
        currentLocation: 'Mumbai',
        experienceLevel: 'Fresher',
        jobStatus: 'Not Working',
        jobProfileDescription: 'Test description',
        educationLevel: 'Graduate',
        course: 'Engineering',
        status: 'applied'
      });
      await application.save();

      const response = await request(app)
        .put(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'shortlisted' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.application.status).toBe('shortlisted');
    });

    test('Should fail with invalid status', async () => {
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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
        .put(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/applications/:id', () => {
    test('Should get application details', async () => {
      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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
        .get(`/api/applications/${application._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('application');
    });

    test('Should fail for unauthorized access', async () => {
      const otherUser = new User({
        firstName: 'Other',
        lastName: 'User',
        email: 'other@test.com',
        password: 'password123',
        phone: '9876543213',
        userType: 'jobseeker',
        userId: 'JW12345680',
        isActive: true
      });
      await otherUser.save();

      const jwt = require('jsonwebtoken');
      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test-secret');

      const application = new Application({
        user: testUser._id,
        job: testJob._id,
        employer: testEmployer._id,
        fullName: 'John Doe',
        email: testUser.email,
        mobileNumber: '9876543212',
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
        .get(`/api/applications/${application._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});


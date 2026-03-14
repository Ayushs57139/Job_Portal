const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Job = require('../models/Job');
const User = require('../models/User');

describe('Jobs API Tests', () => {
  let testEmployer;
  let authToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);

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

    const jwt = require('jsonwebtoken');
    authToken = jwt.sign({ id: testEmployer._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await Job.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Job.deleteMany({});
  });

  describe('GET /api/jobs', () => {
    test('Should get all jobs', async () => {
      // Create test jobs
      const job1 = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job1.save();

      const response = await request(app)
        .get('/api/jobs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobs');
      expect(Array.isArray(response.body.jobs)).toBe(true);
    });

    test('Should filter jobs by location', async () => {
      const job1 = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job1.save();

      const response = await request(app)
        .get('/api/jobs?location=Mumbai');

      expect(response.status).toBe(200);
      expect(response.body.jobs.length).toBeGreaterThan(0);
    });

    test('Should filter jobs by salary range', async () => {
      const job1 = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job1.save();

      const response = await request(app)
        .get('/api/jobs?minSalary=5000&maxSalary=25000');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/jobs/:id', () => {
    test('Should get job by ID', async () => {
      const job = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job.save();

      const response = await request(app)
        .get(`/api/jobs/${job._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('job');
      expect(response.body.job.title).toBe('Software Engineer');
    });

    test('Should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/jobs/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/jobs', () => {
    test('Should create a new job', async () => {
      const jobData = {
        title: 'New Software Engineer',
        description: 'Test job description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: {
          min: 10000,
          max: 20000,
          currency: 'INR'
        },
        employmentType: 'Permanent',
        keySkills: ['JavaScript', 'Node.js']
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('job');
      expect(response.body.job.title).toBe('New Software Engineer');
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'Test Job',
          description: 'Test description'
        });

      expect(response.status).toBe(401);
    });

    test('Should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Job'
          // Missing description, company, etc.
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    test('Should update job', async () => {
      const job = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job.save();

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Software Engineer',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.job.title).toBe('Updated Software Engineer');
    });

    test('Should fail for unauthorized user', async () => {
      const otherEmployer = new User({
        firstName: 'Other',
        lastName: 'Employer',
        email: 'otheremployer@test.com',
        password: 'password123',
        phone: '9876543214',
        userType: 'employer',
        employerType: 'company',
        userId: 'JW12345681',
        isActive: true
      });
      await otherEmployer.save();

      const jwt = require('jsonwebtoken');
      const otherToken = jwt.sign({ id: otherEmployer._id }, process.env.JWT_SECRET || 'test-secret');

      const job = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job.save();

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    test('Should delete job', async () => {
      const job = new Job({
        title: 'Software Engineer',
        description: 'Test description',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Mumbai',
        salary: { min: 10000, max: 20000, currency: 'INR' },
        postedBy: testEmployer._id,
        isActive: true
      });
      await job.save();

      const response = await request(app)
        .delete(`/api/jobs/${job._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      // Verify job is deleted
      const deletedJob = await Job.findById(job._id);
      expect(deletedJob).toBeNull();
    });
  });
});


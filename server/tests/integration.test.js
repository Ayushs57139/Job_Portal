const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

describe('Integration Tests - Critical User Flows', () => {
  let jobseeker;
  let employer;
  let jobseekerToken;
  let employerToken;
  let testJob;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ayushs57139_db_user:7nWvVOGm9hkXupwv@ac-r75tb3w-shard-00-00.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-01.vy1jecc.mongodb.net:27017,ac-r75tb3w-shard-00-02.vy1jecc.mongodb.net:27017/jobwala-test?ssl=true&replicaSet=atlas-p9a5jz-shard-0&authSource=admin&appName=Cluster0';
    await mongoose.connect(mongoUri);

    // Create jobseeker
    jobseeker = new User({
      firstName: 'Job',
      lastName: 'Seeker',
      email: 'jobseeker@test.com',
      password: 'password123',
      phone: '9876543210',
      userType: 'jobseeker',
      userId: 'JW12345678',
      isActive: true
    });
    await jobseeker.save();

    // Create employer
    employer = new User({
      firstName: 'Employer',
      lastName: 'Test',
      email: 'employer@test.com',
      password: 'password123',
      phone: '9876543211',
      userType: 'employer',
      employerType: 'company',
      userId: 'JW12345679',
      isActive: true
    });
    await employer.save();

    const jwt = require('jsonwebtoken');
    jobseekerToken = jwt.sign({ id: jobseeker._id }, process.env.JWT_SECRET || 'test-secret');
    employerToken = jwt.sign({ id: employer._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Application.deleteMany({});
    await Job.deleteMany({});
  });

  describe('Complete Job Application Flow', () => {
    test('Full flow: Create job -> Apply -> View application -> Update status', async () => {
      // Step 1: Employer creates a job
      const createJobResponse = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Software Engineer',
          description: 'We are looking for a software engineer',
          company: {
            name: 'Tech Company',
            type: 'Corporate',
            totalEmployees: '51-100'
          },
          location: 'Mumbai',
          salary: {
            min: 20000,
            max: 40000,
            currency: 'INR'
          },
          employmentType: 'Permanent',
          keySkills: ['JavaScript', 'Node.js', 'React']
        });

      expect(createJobResponse.status).toBe(201);
      testJob = createJobResponse.body.job;

      // Step 2: Jobseeker views available jobs
      const getJobsResponse = await request(app)
        .get('/api/jobs');

      expect(getJobsResponse.status).toBe(200);
      expect(getJobsResponse.body.jobs.length).toBeGreaterThan(0);

      // Step 3: Jobseeker applies for the job
      const applyResponse = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${jobseekerToken}`)
        .send({
          fullName: 'Job Seeker',
          email: jobseeker.email,
          mobileNumber: '9876543210',
          jobId: testJob._id || testJob.id,
          currentLocation: 'Mumbai',
          jobProfileDescription: 'Experienced software developer',
          educationLevel: 'Graduate',
          course: 'Computer Science',
          keySkills: ['JavaScript', 'Node.js']
        });

      expect(applyResponse.status).toBe(201);
      const applicationId = applyResponse.body.application.id;

      // Step 4: Jobseeker views their applications
      const myApplicationsResponse = await request(app)
        .get('/api/applications/my-applications')
        .set('Authorization', `Bearer ${jobseekerToken}`);

      expect(myApplicationsResponse.status).toBe(200);
      expect(myApplicationsResponse.body.applications.length).toBeGreaterThan(0);

      // Step 5: Employer views applications for their job
      const jobApplicationsResponse = await request(app)
        .get(`/api/applications/job/${testJob._id || testJob.id}`)
        .set('Authorization', `Bearer ${employerToken}`);

      expect(jobApplicationsResponse.status).toBe(200);
      expect(jobApplicationsResponse.body.applications.length).toBeGreaterThan(0);

      // Step 6: Employer updates application status
      const updateStatusResponse = await request(app)
        .put(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'shortlisted' });

      expect(updateStatusResponse.status).toBe(200);
      expect(updateStatusResponse.body.application.status).toBe('shortlisted');
    });
  });

  describe('User Registration and Login Flow', () => {
    test('Complete flow: Register -> Login -> Get Profile', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          password: 'password123',
          phone: '9876543212',
          userType: 'jobseeker'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('token');
      const registerToken = registerResponse.body.token;

      // Step 2: Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      const loginToken = loginResponse.body.token;

      // Step 3: Get user profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.email).toBe('newuser@test.com');
    });
  });

  describe('Direct Application Flow (Without Login)', () => {
    test('User can apply without account, account is auto-created', async () => {
      // Create a job first
      const job = new Job({
        title: 'Direct Apply Job',
        description: 'Test job for direct application',
        company: {
          name: 'Test Company',
          type: 'Corporate',
          totalEmployees: '51-100'
        },
        location: 'Delhi',
        salary: { min: 15000, max: 30000, currency: 'INR' },
        postedBy: employer._id,
        isActive: true
      });
      await job.save();

      // Apply directly without login
      const directApplyResponse = await request(app)
        .post('/api/applications/direct')
        .send({
          fullName: 'Direct Applicant',
          email: 'direct@test.com',
          mobileNumber: '9876543213',
          jobId: job._id.toString(),
          currentLocation: 'Delhi',
          jobProfileDescription: 'I want to apply for this job',
          educationLevel: 'Graduate',
          course: 'Engineering',
          keySkills: ['JavaScript']
        });

      expect(directApplyResponse.status).toBe(201);
      expect(directApplyResponse.body).toHaveProperty('isNewUser');
      expect(directApplyResponse.body).toHaveProperty('token');
      expect(directApplyResponse.body).toHaveProperty('user');

      // Verify user was created
      const createdUser = await User.findOne({ email: 'direct@test.com' });
      expect(createdUser).not.toBeNull();
      expect(createdUser.userType).toBe('jobseeker');
    });
  });
});


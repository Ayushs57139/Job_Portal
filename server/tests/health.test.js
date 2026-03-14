const request = require('supertest');
const app = require('../index');

describe('Health Check Tests', () => {
  test('GET /api/health should return server status', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('memory');
  });

  test('Health check should include database connection status', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.body.database).toHaveProperty('connected');
    expect(response.body.database).toHaveProperty('state');
  });

  test('Health check should include memory usage', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.body.memory).toHaveProperty('used');
    expect(response.body.memory).toHaveProperty('total');
  });
});


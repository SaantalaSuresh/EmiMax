const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./app.js');

describe('Test API endpoints', () => {
  let token;

  beforeAll(() => {
    // Generate JWT token for testing
    token = jwt.sign({ username: 'testuser' }, 'Epimax');
  });

  it('should fetch all tasks', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(0);
  });

  it('should fetch a specific task', async () => {
    const res = await request(app)
      .get('/tasks/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(2); // Check if task with id 1 exists
  });

  it('should return 404 if task not found', async () => {
    const res = await request(app)
      .get('/tasks/532')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(404); // Expect 404 if task not found
  });

  it('should add a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'pending',
        assignee_id: 1
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put('/tasks/2')
      .send({
        title: 'Updated Task',
        description: 'This is an updated test task',
        status: 'completed',
        assignee_id: 1
      })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete('/tasks/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });
});

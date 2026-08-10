const request = require('supertest');
const app = require('../../app');
const db = require('../../models');

const stamp = Date.now();
const emails = {
  client: `api-client-${stamp}@example.com`,
  worker: `api-worker-${stamp}@example.com`,
  mentor: `api-mentor-${stamp}@example.com`,
};

let clientToken;
let workerToken;
let mentorToken;
let workerId;
let mentorId;
let skillId;
let taskId;
let gigId;
let matchId;
let transactionId;

afterAll(async () => {
  await db.User.destroy({ where: { email: Object.values(emails) } });
  await db.sequelize.close();
});

describe('auth', () => {
  test('registers a client, worker, and mentor', async () => {
    const client = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Aline Client', email: emails.client, password: 'pass1234', role: 'client' });
    expect(client.status).toBe(201);
    clientToken = client.body.token;

    const worker = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Eric Worker', email: emails.worker, password: 'pass1234', role: 'worker' });
    expect(worker.status).toBe(201);
    workerToken = worker.body.token;
    workerId = worker.body.userId;

    const mentor = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Grace Mentor', email: emails.mentor, password: 'pass1234', role: 'mentor' });
    expect(mentor.status).toBe(201);
    mentorToken = mentor.body.token;
    mentorId = mentor.body.userId;
  });

  test('rejects a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: emails.client, password: 'pass1234', role: 'client' });
    expect(res.status).toBe(409);
  });

  test('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: emails.client, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('rejects requests with no token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  test('never returns passwordHash on the profile', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.passwordHash).toBeUndefined();
  });
});

describe('skill verification', () => {
  test('worker sets their location', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ locationLat: -1.9536, locationLng: 30.0605 });
    expect(res.status).toBe(200);
    expect(res.body.locationLat).toBe(-1.9536);
  });

  test('looks up the seeded digital_web skill', async () => {
    const res = await request(app).get('/api/skills').query({ category: 'digital_web' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    skillId = res.body[0].id;
  });

  test('worker submits a skill task and is auto-assigned a reviewer (not themselves)', async () => {
    const res = await request(app)
      .post('/api/skill-tasks')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ skillId, evidenceUrl: 'https://example.com/evidence.png', notes: 'Sample work' });

    expect(res.status).toBe(201);
    expect(res.body.reviewerId).toBe(mentorId);
    expect(res.body.reviewerId).not.toBe(workerId);
    taskId = res.body.id;
  });

  test('the worker cannot review their own task', async () => {
    const res = await request(app)
      .put(`/api/skill-tasks/${taskId}/review`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(403);
  });

  test('the assigned mentor approves the task', async () => {
    const res = await request(app)
      .put(`/api/skill-tasks/${taskId}/review`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});

describe('gigs and matching', () => {
  test('client posts a gig', async () => {
    const res = await request(app)
      .post('/api/gigs')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        title: 'Build a landing page',
        description: 'Need a one-page site',
        budget: 50000,
        skillId,
        locationLat: -1.9441,
        locationLng: 30.0619,
      });
    expect(res.status).toBe(201);
    gigId = res.body.id;
  });

  test('a worker cannot post a gig', async () => {
    const res = await request(app)
      .post('/api/gigs')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ title: 'x', description: 'y', budget: 1, skillId, locationLat: 0, locationLng: 0 });
    expect(res.status).toBe(403);
  });

  test('ranked candidates include the verified nearby worker with a computed distance', async () => {
    const res = await request(app)
      .get(`/api/gigs/${gigId}/candidates`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].workerId).toBe(workerId);
    expect(typeof res.body[0].distanceKm).toBe('number');
  });

  test('client creates a match, flipping the gig to matched', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ gigId, workerId });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    matchId = res.body.id;

    const gigRes = await request(app).get(`/api/gigs/${gigId}`);
    expect(gigRes.body.status).toBe('matched');
  });
});

describe('match lifecycle and simulated payment', () => {
  test('cannot skip straight from pending to completed', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}/status`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(409);
  });

  test('worker accepts the match', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}/status`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');
  });

  test('completing the match auto-initiates a simulated transaction', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.transaction).toBeTruthy();
    expect(res.body.transaction.status).toBe('initiated');
    transactionId = res.body.transaction.id;
  });

  test('either party can confirm the simulated payment', async () => {
    const res = await request(app)
      .post(`/api/transactions/${transactionId}/confirm`)
      .set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });
});

describe('reviews and trust score', () => {
  test('client reviews the worker', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ matchId, rating: 5, comment: 'Great work' });
    expect(res.status).toBe(201);
  });

  test('cannot review the same match twice as the same author', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ matchId, rating: 4 });
    expect(res.status).toBe(409);
  });

  test("worker's trust score reflects the new review", async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${workerToken}`);
    expect(res.body.trustScore).toBe(5);
  });
});

describe('mentorship messaging', () => {
  test('worker messages the mentor who reviewed them', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ recipientId: mentorId, body: 'Thanks for reviewing my task!' });
    expect(res.status).toBe(201);
  });

  test('the thread is visible to the sender', async () => {
    const res = await request(app)
      .get('/api/messages')
      .query({ recipientId: mentorId })
      .set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

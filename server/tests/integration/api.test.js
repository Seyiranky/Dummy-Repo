const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../app');
const db = require('../../models');

const stamp = Date.now();
const emails = {
  client: `api-client-${stamp}@example.com`,
  worker: `api-worker-${stamp}@example.com`,
  admin: `api-admin-${stamp}@example.com`,
};

let clientToken;
let workerToken;
let adminToken;
let workerId;
let adminId;
let skillId;
let taskId;
let gigId;
let applicationId;
let matchId;
let transactionId;

afterAll(async () => {
  await db.User.destroy({ where: { email: Object.values(emails) } });
  await db.sequelize.close();
});

describe('auth', () => {
  test('registers a client and a worker', async () => {
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
  });

  test('rejects self-registering as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Nope', email: `nope-${stamp}@example.com`, password: 'pass1234', role: 'admin' });
    expect(res.status).toBe(400);
  });

  test('provisions an admin directly (not self-registerable) and logs in', async () => {
    const passwordHash = await bcrypt.hash('pass1234', 10);
    const admin = await db.User.create({ name: 'Grace Admin', email: emails.admin, passwordHash, role: 'admin' });
    adminId = admin.id;

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: emails.admin, password: 'pass1234' });
    expect(login.status).toBe(200);
    adminToken = login.body.token;
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
    expect(res.body.reviewerId).toBe(adminId);
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

  test('the assigned admin approves the task', async () => {
    const res = await request(app)
      .put(`/api/skill-tasks/${taskId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});

describe('gigs and applications', () => {
  test('client posts a gig, starting in pending_review', async () => {
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
    expect(res.body.status).toBe('pending_review');
    gigId = res.body.id;
  });

  test('a worker cannot post a gig', async () => {
    const res = await request(app)
      .post('/api/gigs')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ title: 'x', description: 'y', budget: 1, skillId, locationLat: 0, locationLng: 0 });
    expect(res.status).toBe(403);
  });

  test('a worker cannot apply while the gig is still pending review', async () => {
    const res = await request(app)
      .post('/api/gig-applications')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ gigId });
    expect(res.status).toBe(409);
  });

  test('admin approves the gig, publishing it', async () => {
    const res = await request(app)
      .put(`/api/admin/gigs/${gigId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('open');
  });

  test('worker applies to the now-open gig', async () => {
    const res = await request(app)
      .post('/api/gig-applications')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ gigId });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    applicationId = res.body.id;
  });

  test('the same worker cannot apply twice', async () => {
    const res = await request(app)
      .post('/api/gig-applications')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ gigId });
    expect(res.status).toBe(409);
  });

  test('admin approves the application, creating an accepted match and flipping the gig to matched', async () => {
    const res = await request(app)
      .put(`/api/gig-applications/${applicationId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approved' });
    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('approved');
    expect(res.body.match.status).toBe('accepted');
    matchId = res.body.match.id;

    const gigRes = await request(app).get(`/api/gigs/${gigId}`);
    expect(gigRes.body.status).toBe('matched');
  });
});

describe('match lifecycle and simulated payment', () => {
  test('cannot transition an accepted match backwards to pending', async () => {
    const res = await request(app)
      .put(`/api/matches/${matchId}/status`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ status: 'pending' });
    expect(res.status).toBe(409);
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

describe('worker-admin messaging', () => {
  test('worker messages the admin who reviewed them', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({ recipientId: adminId, body: 'Thanks for reviewing my task!' });
    expect(res.status).toBe(201);
  });

  test('the thread is visible to the sender', async () => {
    const res = await request(app)
      .get('/api/messages')
      .query({ recipientId: adminId })
      .set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

import request from 'supertest';
import mongoose from 'mongoose';
import app from './server.js';

describe('T24 Watches CMS API Endpoints', () => {
  let token = '';

  afterAll(async () => {
    // Cleanly close the Mongoose connection after all tests run
    await mongoose.connection.close();
  });

  // 1. GET /api/homepage (Public)
  describe('GET /api/homepage', () => {
    it('should fetch the dynamic homepage configuration and sections content', async () => {
      const res = await request(app)
        .get('/api/homepage')
        .expect(200);

      expect(res.body).toHaveProperty('heroTitle');
      expect(res.body).toHaveProperty('specsBarItems');
      expect(res.body).toHaveProperty('newArrivals');
      expect(res.body).toHaveProperty('footerCopyright');
    });
  });

  // 2. GET /api/products (Public)
  describe('GET /api/products', () => {
    it('should return a paginated list of catalog watches', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.products)).toBe(true);
    });
  });

  // 3. POST /api/admin/login (Public Auth)
  describe('POST /api/admin/login', () => {
    it('should reject invalid credentials with 400', async () => {
      await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(400);
    });

    it('should authenticate default administrator and return a signed JWT token', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: 'admin12345' })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
  });

  // 4. PUT /api/admin/homepage (Protected Auth)
  describe('PUT /api/admin/homepage', () => {
    it('should reject unauthorized edits with 401 status', async () => {
      await request(app)
        .put('/api/admin/homepage')
        .send({ heroTitle: 'UNAUTHORIZED EDIT' })
        .expect(401);
    });

    it('should update homepage configuration parameters when authorized with JWT', async () => {
      const res = await request(app)
        .put('/api/admin/homepage')
        .set('Authorization', `Bearer ${token}`)
        .send({
          heroTitle: 'TEST TITLE MODIFICATION',
          footerCopyright: '© 2026 Test Suite. All rights reserved.'
        })
        .expect(200);

      expect(res.body.message).toContain('updated successfully');

      // Verify that changes are persisted in the DB
      const getRes = await request(app).get('/api/homepage');
      expect(getRes.body.heroTitle).toBe('TEST TITLE MODIFICATION');
      expect(getRes.body.footerCopyright).toBe('© 2026 Test Suite. All rights reserved.');
    });
  });
});

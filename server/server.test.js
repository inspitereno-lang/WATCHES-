import request from 'supertest';
import mongoose from 'mongoose';
import app from './server.js';

describe('T24 Watches CMS API Endpoints', () => {
  let token = '';
  beforeAll(async () => {
    // Seed the isolated test database with the test admin and homepage defaults
    const User = mongoose.model('User');
    const Homepage = mongoose.model('Homepage');

    await User.deleteMany({});
    await Homepage.deleteMany({});

    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash('admin12345', salt);
    await User.create({
      username: 'admin',
      email: 'admin@t24watches.com',
      passwordHash: passwordHash
    });

    await Homepage.create({});
  });

  afterAll(async () => {
    // Cleanly close the Mongoose connection after all tests run
    await mongoose.connection.close();
  });

  // 0.8 GET /api/categories (Public)
  describe('GET /api/categories', () => {
    it('should fetch the hardcoded list of brands, audiences, and models', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(res.body).toHaveProperty('brands');
      expect(res.body).toHaveProperty('audiences');
      expect(res.body).toHaveProperty('brandModels');
      expect(Array.isArray(res.body.brands)).toBe(true);
      expect(res.body.brands).toContain('Rolex');
      expect(res.body.brandModels).toHaveProperty('Rolex');
    });
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
      expect(res.body).toHaveProperty('footerContactImage');
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
          footerCopyright: '© 2026 Test Suite. All rights reserved.',
          footerContactImage: 'https://res.cloudinary.com/test-image.jpg'
        })
        .expect(200);

      expect(res.body.message).toContain('updated successfully');

      // Verify that changes are persisted in the DB
      const getRes = await request(app).get('/api/homepage');
      expect(getRes.body.heroTitle).toBe('TEST TITLE MODIFICATION');
      expect(getRes.body.footerCopyright).toBe('© 2026 Test Suite. All rights reserved.');
      expect(getRes.body.footerContactImage).toBe('https://res.cloudinary.com/test-image.jpg');
    });
  });

  // 5. Product Specs CRUD and Category Normalization
  describe('Product Specs CRUD & Filtering', () => {
    let createdProduct = null;

    it('should create a new product with specification fields and normalize audience', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Submariner Date 41mm Spec Test',
          brand: 'Rolex',
          factory: 'VSF',
          audience: 'Gents', // Should normalize to Mens
          priceUSD: '$1,450.00',
          priceAED: 'AED 5,320',
          image: 'https://res.cloudinary.com/test-watch.jpg',
          movement: 'VS3235 Automatic',
          casing: 'Oystersteel',
          bezel: 'Ceramic bezel',
          glass: 'Sapphire glass',
          waterResistance: '100m waterproof',
          description: 'A test watch with high accuracy caliber.',
          model: 'Submariner Date',
          reference: '126610LN',
          material: '904L anti-corrosive stainless steel',
          size: '41 mm',
          caliber: 'VS3235',
          warranty: '2-Year Service Warranty'
        })
        .expect(201);

      expect(res.body).toHaveProperty('product');
      expect(res.body.product.audience).toBe('Mens'); // Normalized!
      expect(res.body.product.model).toBe('Submariner Date');
      expect(res.body.product.reference).toBe('126610LN');
      expect(res.body.product.caliber).toBe('VS3235');
      createdProduct = res.body.product;
    });

    it('should fetch products and filter correctly by normalized categories', async () => {
      const res = await request(app)
        .get('/api/products?audience=Mens')
        .expect(200);

      expect(res.body).toHaveProperty('products');
      const testProduct = res.body.products.find(p => p.id === createdProduct.id);
      expect(testProduct).toBeDefined();
      expect(testProduct.audience).toBe('Mens');
    });

    it('should update product specifications via PUT', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          reference: '126610LN-UPDATED',
          size: '42 mm',
          audience: 'Ladies' // Should normalize to Womens
        })
        .expect(200);

      expect(res.body.product.reference).toBe('126610LN-UPDATED');
      expect(res.body.product.size).toBe('42 mm');
      expect(res.body.product.audience).toBe('Womens'); // Normalized!
    });

    it('should delete the test product', async () => {
      await request(app)
        .delete(`/api/products/${createdProduct.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const res = await request(app)
        .get('/api/products')
        .expect(200);

      const deletedProduct = res.body.products.find(p => p.id === createdProduct.id);
      expect(deletedProduct).toBeUndefined();
    });
  });
});

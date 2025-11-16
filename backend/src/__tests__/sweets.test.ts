/// <reference types="jest" />
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import User from '../models/User';
import Sweet from '../models/Sweet';
import { generateToken } from '../utils/jwt';

describe('Sweets API', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet-shop-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Sweet.deleteMany({});
    
    // Create regular user
    const user = await User.create({
      username: 'testuser',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });
    userId = (user._id as mongoose.Types.ObjectId).toString();
    userToken = generateToken(userId);

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = (admin._id as mongoose.Types.ObjectId).toString();
    adminToken = generateToken(adminId);
  });

  describe('POST /api/sweets', () => {
    it('should create a sweet (admin only)', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet.name).toBe('Chocolate Bar');
      expect(response.body.sweet.category).toBe('Chocolate');
      expect(response.body.sweet.price).toBe(5.99);
      expect(response.body.sweet.quantity).toBe(100);
    });

    it('should not allow regular users to create sweets', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100,
        });

      expect(response.status).toBe(403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'Chocolate', price: 5.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummies', price: 3.99, quantity: 50 },
      ]);
    });

    it('should get all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sweets');
      expect(response.body.sweets).toHaveLength(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'Chocolate', price: 5.99, quantity: 100 },
        { name: 'Dark Chocolate', category: 'Chocolate', price: 7.99, quantity: 50 },
        { name: 'Gummy Bears', category: 'Gummies', price: 3.99, quantity: 50 },
      ]);
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(2);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Gummies')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(1);
      expect(response.body.sweets[0].category).toBe('Gummies');
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=4&maxPrice=6')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(1);
      expect(response.body.sweets[0].price).toBe(5.99);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100,
      });
      sweetId = (sweet._id as mongoose.Types.ObjectId).toString();
    });

    it('should update a sweet (admin only)', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Chocolate Bar',
          category: 'Chocolate',
          price: 6.99,
          quantity: 150,
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.name).toBe('Updated Chocolate Bar');
      expect(response.body.sweet.price).toBe(6.99);
    });

    it('should not allow regular users to update sweets', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Chocolate Bar',
          category: 'Chocolate',
          price: 6.99,
          quantity: 150,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100,
      });
      sweetId = (sweet._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete a sweet (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      const deletedSweet = await Sweet.findById(sweetId);
      expect(deletedSweet).toBeNull();
    });

    it('should not allow regular users to delete sweets', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100,
      });
      sweetId = (sweet._id as mongoose.Types.ObjectId).toString();
    });

    it('should purchase a sweet and decrease quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(95);

      const updatedSweet = await Sweet.findById(sweetId);
      expect(updatedSweet?.quantity).toBe(95);
    });

    it('should not allow purchase if insufficient quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 150 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient quantity');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100,
      });
      sweetId = (sweet._id as mongoose.Types.ObjectId).toString();
    });

    it('should restock a sweet (admin only)', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(150);

      const updatedSweet = await Sweet.findById(sweetId);
      expect(updatedSweet?.quantity).toBe(150);
    });

    it('should not allow regular users to restock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 });

      expect(response.status).toBe(403);
    });
  });
});


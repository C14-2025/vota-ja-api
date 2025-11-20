import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppFactory.create();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users (Register)', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for password shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'short@example.com',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    const testUser = {
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'Password123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeTruthy();
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return 401 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should return 401 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'Password123',
        })
        .expect(401);
    });

    it('should return 401 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(401);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'Password123',
        })
        .expect(400);
    });
  });

  describe('Authentication Flow', () => {
    const flowUser = {
      name: 'Flow Test User',
      email: 'flow@example.com',
      password: 'FlowPass123',
    };

    it('should complete full authentication flow: register -> login -> access protected route', async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/users')
        .send(flowUser)
        .expect(201);

      const userId = registerResponse.body.id;
      expect(userId).toBeTruthy();

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: flowUser.email,
          password: flowUser.password,
        })
        .expect(201);

      const accessToken = loginResponse.body.accessToken;
      expect(accessToken).toBeTruthy();

      const protectedResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(protectedResponse.body.id).toBe(userId);
      expect(protectedResponse.body.email).toBe(flowUser.email);
      expect(protectedResponse.body.name).toBe(flowUser.name);
      expect(protectedResponse.body).not.toHaveProperty('password');
    });

    it('should return 401 when accessing protected route without token', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 401 when accessing protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });

    it('should return 401 when accessing protected route with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);
    });
  });
});

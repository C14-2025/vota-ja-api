import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';

describe('User E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let secondAccessToken: string;
  let secondUserId: string;

  beforeAll(async () => {
    app = await TestAppFactory.create();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users (Create User)', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john.doe@example.com');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      userId = response.body.id;
    });

    it('should create another user for testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: 'Password456',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Jane Smith');
      expect(response.body.email).toBe('jane.smith@example.com');

      secondUserId = response.body.id;
    });

    it('should return 400 for missing name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
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
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: '',
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for empty email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: '',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for empty password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '',
        })
        .expect(400);
    });

    it('should return 400 or 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Another User',
          email: 'john.doe@example.com', // Email já usado
          password: 'Password123',
        })
        .expect(res => {
          expect([400, 409]).toContain(res.status);
        });
    });

    it('should return 400 for non-string name', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 123,
          email: 'test@example.com',
          password: 'Password123',
        })
        .expect(400);
    });

    it('should return 400 for non-string password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 123456,
        })
        .expect(400);
    });
  });

  describe('GET /users (List All Users)', () => {
    beforeAll(async () => {
      // Login com o primeiro usuário para obter token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'Password123',
        })
        .expect(201);

      accessToken = loginResponse.body.accessToken;

      // Login com o segundo usuário
      const secondLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jane.smith@example.com',
          password: 'Password456',
        })
        .expect(201);

      secondAccessToken = secondLoginResponse.body.accessToken;

      // Criar alguns usuários adicionais para listar
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/users')
          .send({
            name: `Test User ${i}`,
            email: `testuser${i}@example.com`,
            password: 'Password123',
          });
      }
    });

    it('should list all users with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).not.toHaveProperty('password');
    });

    it('should return 401 when listing users without authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should include all created users in the list', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const userIds = response.body.map((user: any) => user.id);
      expect(userIds).toContain(userId);
      expect(userIds).toContain(secondUserId);
    });
  });

  describe('GET /users/:id (Get User By ID)', () => {
    it('should get user by id with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should get another user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${secondUserId}`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(secondUserId);
      expect(response.body.name).toBe('Jane Smith');
      expect(response.body.email).toBe('jane.smith@example.com');
    });

    it('should return 401 when getting user without authentication', async () => {
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 404 for non-existent user id', async () => {
      await request(app.getHttpServer())
        .get('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('User Flow Integration', () => {
    it('should complete full user creation, login and retrieval flow', async () => {
      // Criar usuário
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Integration Test User',
          email: 'integration@example.com',
          password: 'Password123',
        })
        .expect(201);

      const newUserId = createResponse.body.id;
      expect(newUserId).toBeTruthy();
      expect(createResponse.body.name).toBe('Integration Test User');
      expect(createResponse.body.email).toBe('integration@example.com');

      // Login com o usuário criado
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'Password123',
        })
        .expect(201);

      const newUserToken = loginResponse.body.accessToken;
      expect(newUserToken).toBeTruthy();

      // Buscar o usuário por ID
      const getResponse = await request(app.getHttpServer())
        .get(`/users/${newUserId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(getResponse.body.id).toBe(newUserId);
      expect(getResponse.body.name).toBe('Integration Test User');
      expect(getResponse.body.email).toBe('integration@example.com');

      // Verificar que o usuário aparece na listagem
      const listResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      const foundUser = listResponse.body.find(
        (user: any) => user.id === newUserId,
      );
      expect(foundUser).toBeTruthy();
      expect(foundUser.email).toBe('integration@example.com');
    });

    it('should verify password is never exposed in responses', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Security Test User',
          email: 'security@example.com',
          password: 'SecretPassword123',
        })
        .expect(201);

      expect(createResponse.body).not.toHaveProperty('password');

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'security@example.com',
          password: 'SecretPassword123',
        })
        .expect(201);

      const token = loginResponse.body.accessToken;
      const securityUserId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/users/${securityUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body).not.toHaveProperty('password');

      const listResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      listResponse.body.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should handle multiple concurrent user operations', async () => {
      const users = await Promise.all([
        request(app.getHttpServer()).post('/users').send({
          name: 'Concurrent User 1',
          email: 'concurrent1@example.com',
          password: 'Password123',
        }),
        request(app.getHttpServer()).post('/users').send({
          name: 'Concurrent User 2',
          email: 'concurrent2@example.com',
          password: 'Password123',
        }),
        request(app.getHttpServer()).post('/users').send({
          name: 'Concurrent User 3',
          email: 'concurrent3@example.com',
          password: 'Password123',
        }),
      ]);

      users.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
      });

      const userIds = users.map(res => res.body.id);
      expect(new Set(userIds).size).toBe(3); // Todos os IDs são únicos
    });
  });
});

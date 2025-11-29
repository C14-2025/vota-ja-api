import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';
import PollTypes from '~/domain/enums/PollTypes';

describe('Poll E2E', () => {
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

  // Setup users before each test suite
  beforeEach(async () => {
    // Use unique emails for each test run to avoid conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);

    // Create first test user and login
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Poll Test User',
        email: `polluser_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    console.log(registerResponse.error);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `polluser_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    // Create second test user and login
    const secondRegisterResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Second Poll User',
        email: `seconduser_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondUserId = secondRegisterResponse.body.id;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `seconduser_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;
  });

  describe('POST /polls (Create Poll)', () => {
    it('should create a new poll with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Qual a melhor linguagem de programação?',
          description: 'Votação para escolher a melhor linguagem',
          type: PollTypes.PUBLIC,
          options: ['TypeScript', 'JavaScript', 'Python', 'Go'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBeTruthy();
      expect(response.body.title).toBe(
        'Qual a melhor linguagem de programação?',
      );
      expect(response.body.description).toBe(
        'Votação para escolher a melhor linguagem',
      );
      expect(response.body.type).toBe(PollTypes.PUBLIC);
      expect(response.body.options).toHaveLength(4);

      // Validate option structure
      response.body.options.forEach((option: any) => {
        expect(option).toHaveProperty('id');
        expect(option.id).toBeTruthy();
        expect(option).toHaveProperty('text');
        expect(option.text).toBeTruthy();
        expect(option).toHaveProperty('createdAt');
      });

      // Validate creator
      expect(response.body).toHaveProperty('creator');
      expect(response.body.creator).toHaveProperty('id');
      expect(response.body.creator.id).toBe(userId);

      expect(response.body).toHaveProperty('createdAt');
      expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
    });

    it('should create a private poll', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Private Poll',
          description: 'This is a private poll',
          type: PollTypes.PRIVATE,
          options: ['Option A', 'Option B'],
        })
        .expect(201);

      expect(response.body.type).toBe(PollTypes.PRIVATE);
      expect(response.body.title).toBe('Private Poll');
      expect(response.body.options).toHaveLength(2);
    });

    it('should return 401 when creating poll without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some((msg: string) => msg.toLowerCase().includes('title')),
      ).toBe(true);
    });

    it('should return 400 for missing description', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some((msg: string) =>
          msg.toLowerCase().includes('description'),
        ),
      ).toBe(true);
    });

    it('should return 400 for missing type', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some((msg: string) => msg.toLowerCase().includes('type')),
      ).toBe(true);
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: 'INVALID_TYPE',
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some((msg: string) => msg.toLowerCase().includes('type')),
      ).toBe(true);
    });

    it('should return 400 for missing options', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some((msg: string) => msg.toLowerCase().includes('option')),
      ).toBe(true);
    });

    it('should return 400 for less than 2 options', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Only One Option'],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];
      expect(
        messages.some(
          (msg: string) =>
            msg.toLowerCase().includes('option') ||
            msg.toLowerCase().includes('2') ||
            msg.toLowerCase().includes('two'),
        ),
      ).toBe(true);
    });

    it('should return 400 for empty options array', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: [],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for non-string options', async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: [123, 456],
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /polls (List All Polls)', () => {
    it('should list polls with default pagination', async () => {
      // Create some polls first
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll 1',
          description: 'Description 1',
          type: PollTypes.PUBLIC,
          options: ['A', 'B'],
        });

      const response = await request(app.getHttpServer())
        .get('/polls')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('totalItems');
      expect(response.body.meta).toHaveProperty('itemCount');
      expect(response.body.meta).toHaveProperty('itemsPerPage');
      expect(response.body.meta).toHaveProperty('totalPages');
      expect(response.body.meta).toHaveProperty('currentPage');
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.meta.itemsPerPage).toBe(10);
      expect(response.body.meta.currentPage).toBe(1);
    });

    it('should respect custom page parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?page=2')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(2);
      expect(response.body.items).toBeInstanceOf(Array);
    });

    it('should respect custom limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?limit=5')
        .expect(200);

      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
      expect(response.body.meta.itemCount).toBe(response.body.items.length);
    });

    it('should combine page and limit parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?page=2&limit=5')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(2);
      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should search polls by title', async () => {
      const uniqueTitle = `UniqueSearchTitle_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: uniqueTitle,
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/polls?search=${encodeURIComponent(uniqueTitle)}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].title).toBe(uniqueTitle);
    });

    it('should search polls by description', async () => {
      const uniqueDesc = `SuperUniqueDescription_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll for Description Search',
          description: uniqueDesc,
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/polls?search=${encodeURIComponent(uniqueDesc)}`)
        .expect(200);

      expect(response.body.items.length).toBeGreaterThanOrEqual(1);
      expect(response.body.items[0].description).toBe(uniqueDesc);
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?search=NonExistentSearchTerm12345XYZ999ABC')
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.meta.totalItems).toBe(0);
    });

    it('should work without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
    });
  });

  describe('GET /polls/:id (Get Poll By ID)', () => {
    let testPollId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Poll for Retrieval',
          description: 'This poll will be retrieved by ID',
          type: PollTypes.PUBLIC,
          options: ['Option A', 'Option B', 'Option C'],
        })
        .expect(201);

      testPollId = response.body.id;
    });

    it('should get poll by id with complete structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/polls/${testPollId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPollId,
        title: 'Poll for Retrieval',
        description: 'This poll will be retrieved by ID',
        type: PollTypes.PUBLIC,
        totalVotes: 0,
      });

      expect(response.body).toHaveProperty('options');
      expect(response.body.options).toHaveLength(3);

      response.body.options.forEach((option: any) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('text');
        expect(option).toHaveProperty('votesCount');
        expect(option.votesCount).toBe(0);
      });

      expect(response.body).toHaveProperty('creator');
      expect(response.body.creator.id).toBe(userId);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should get poll by id without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/polls/${testPollId}`)
        .expect(200);

      expect(response.body.id).toBe(testPollId);
    });

    it('should get poll by id with authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/polls/${testPollId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(testPollId);
    });

    it('should return 404 for non-existent poll id', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Poll Flow Integration', () => {
    it('should complete full poll creation and retrieval flow', async () => {
      const uniqueTitle = `Integration Test Poll ${Date.now()}`;

      const createResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: uniqueTitle,
          description: 'Testing full flow',
          type: PollTypes.PUBLIC,
          options: ['Choice 1', 'Choice 2', 'Choice 3'],
        })
        .expect(201);

      const pollId = createResponse.body.id;
      expect(pollId).toBeTruthy();
      expect(createResponse.body.options).toHaveLength(3);

      const getResponse = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(pollId);
      expect(getResponse.body.title).toBe(uniqueTitle);
      expect(getResponse.body.options).toHaveLength(3);
      expect(getResponse.body.totalVotes).toBe(0);

      const listResponse = await request(app.getHttpServer())
        .get(`/polls?search=${encodeURIComponent(uniqueTitle)}`)
        .expect(200);

      const foundPoll = listResponse.body.items.find(
        (poll: any) => poll.id === pollId,
      );
      expect(foundPoll).toBeDefined();
      expect(foundPoll.title).toBe(uniqueTitle);
    });

    it('should handle multiple users creating polls independently', async () => {
      const timestamp = Date.now();

      const firstUserPoll = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `First User Poll ${timestamp}`,
          description: 'Created by first user',
          type: PollTypes.PUBLIC,
          options: ['A', 'B'],
        })
        .expect(201);

      const secondUserPoll = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          title: `Second User Poll ${timestamp}`,
          description: 'Created by second user',
          type: PollTypes.PUBLIC,
          options: ['X', 'Y'],
        })
        .expect(201);

      expect(firstUserPoll.body.creator.id).toBe(userId);
      expect(secondUserPoll.body.creator.id).toBe(secondUserId);
      expect(firstUserPoll.body.id).not.toBe(secondUserPoll.body.id);

      // Verify both can be retrieved
      const firstPollGet = await request(app.getHttpServer())
        .get(`/polls/${firstUserPoll.body.id}`)
        .expect(200);

      const secondPollGet = await request(app.getHttpServer())
        .get(`/polls/${secondUserPoll.body.id}`)
        .expect(200);

      expect(firstPollGet.body.creator.id).toBe(userId);
      expect(secondPollGet.body.creator.id).toBe(secondUserId);
    });
  });
});

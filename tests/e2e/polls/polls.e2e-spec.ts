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

    // Create first test user and login
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Poll Test User',
        email: 'polluser@example.com',
        password: 'Password123',
      })
      .expect(201);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'polluser@example.com',
        password: 'Password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    // Create second test user and login
    const secondRegisterResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Second Poll User',
        email: 'seconduser@example.com',
        password: 'Password123',
      })
      .expect(201);

    secondUserId = secondRegisterResponse.body.id;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'seconduser@example.com',
        password: 'Password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
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
      expect(response.body.title).toBe(
        'Qual a melhor linguagem de programação?',
      );
      expect(response.body.description).toBe(
        'Votação para escolher a melhor linguagem',
      );
      expect(response.body.type).toBe(PollTypes.PUBLIC);
      expect(response.body.options).toHaveLength(4);
      expect(response.body.options[0]).toHaveProperty('id');
      expect(response.body.options[0]).toHaveProperty('text');
      expect(response.body.options[0]).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('creator');
      expect(response.body.creator.id).toBe(userId);
      expect(response.body).toHaveProperty('createdAt');
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
    });

    it('should return 401 when creating poll without authentication', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(401);
    });

    it('should return 400 for missing title', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);
    });

    it('should return 400 for missing description', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);
    });

    it('should return 400 for missing type', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);
    });

    it('should return 400 for invalid type', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: 'INVALID_TYPE',
          options: ['Option 1', 'Option 2'],
        })
        .expect(400);
    });

    it('should return 400 for missing options', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
        })
        .expect(400);
    });

    it('should return 400 for less than 2 options', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Only One Option'],
        })
        .expect(400);
    });

    it('should return 400 for empty options array', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: [],
        })
        .expect(400);
    });

    it('should return 400 for non-string options', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: [123, 456],
        })
        .expect(400);
    });
  });

  describe('GET /polls (List All Polls)', () => {
    beforeAll(async () => {
      // Create multiple polls for pagination testing
      for (let i = 1; i <= 15; i++) {
        await request(app.getHttpServer())
          .post('/polls')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            title: `Poll ${i}`,
            description: `Description for poll ${i}`,
            type: PollTypes.PUBLIC,
            options: [`Option A${i}`, `Option B${i}`],
          });
      }
    });

    it('should list all polls with default pagination', async () => {
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
    });

    it('should respect custom limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?limit=5')
        .expect(200);

      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(response.body.items.length).toBeLessThanOrEqual(5);
    });

    it('should combine page and limit parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?page=2&limit=5')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(2);
      expect(response.body.meta.itemsPerPage).toBe(5);
    });

    it('should search polls by title', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Unique Search Title',
          description: 'Test Description',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        });

      const response = await request(app.getHttpServer())
        .get('/polls?search=Unique')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(
        response.body.items.some((poll: any) => poll.title.includes('Unique')),
      ).toBe(true);
    });

    it('should search polls by description', async () => {
      await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Poll',
          description: 'SuperUniqueDescription',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        });

      const response = await request(app.getHttpServer())
        .get('/polls?search=SuperUnique')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(
        response.body.items.some((poll: any) =>
          poll.description.includes('SuperUnique'),
        ),
      ).toBe(true);
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/polls?search=NonExistentSearchTerm12345')
        .expect(200);

      expect(response.body.items.length).toBe(0);
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

    beforeAll(async () => {
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

    it('should get poll by id with vote counts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/polls/${testPollId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testPollId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('options');
      expect(response.body).toHaveProperty('creator');
      expect(response.body).toHaveProperty('totalVotes');
      expect(response.body.options[0]).toHaveProperty('votesCount');
      expect(response.body.totalVotes).toBe(0);
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
      await request(app.getHttpServer())
        .get('/polls/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Poll Flow Integration', () => {
    it('should complete full poll creation and retrieval flow', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Integration Test Poll',
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
      expect(getResponse.body.title).toBe('Integration Test Poll');
      expect(getResponse.body.options).toHaveLength(3);
      expect(getResponse.body.totalVotes).toBe(0);

      const listResponse = await request(app.getHttpServer())
        .get('/polls?search=Integration')
        .expect(200);

      expect(
        listResponse.body.items.some((poll: any) => poll.id === pollId),
      ).toBe(true);
    });

    it('should handle multiple users creating polls', async () => {
      const firstUserPoll = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'First User Poll',
          description: 'Created by first user',
          type: PollTypes.PUBLIC,
          options: ['A', 'B'],
        })
        .expect(201);

      const secondUserPoll = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          title: 'Second User Poll',
          description: 'Created by second user',
          type: PollTypes.PUBLIC,
          options: ['X', 'Y'],
        })
        .expect(201);

      expect(firstUserPoll.body.creator.id).toBe(userId);
      expect(secondUserPoll.body.creator.id).toBe(secondUserId);
      expect(firstUserPoll.body.id).not.toBe(secondUserPoll.body.id);

      const listResponse = await request(app.getHttpServer())
        .get('/polls')
        .expect(200);

      const userPolls = listResponse.body.items.filter(
        (poll: any) =>
          poll.id === firstUserPoll.body.id ||
          poll.id === secondUserPoll.body.id,
      );

      expect(userPolls).toHaveLength(2);
    });
  });
});

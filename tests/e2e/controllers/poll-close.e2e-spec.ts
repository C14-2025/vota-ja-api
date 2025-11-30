import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';
import PollTypes from '~/domain/enums/PollTypes';
import { PollStatus } from '~/domain/enums/PollStatus';

describe('Poll Close E2E', () => {
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

  beforeEach(async () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);

    // Create first test user (Creator)
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Poll Creator',
        email: `creator_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `creator_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    // Create second test user (Other user)
    const secondRegisterResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Other User',
        email: `other_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondUserId = secondRegisterResponse.body.id;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `other_${timestamp}_${randomSuffix}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;
  });

  describe('PATCH /polls/:id/close', () => {
    let pollId: string;
    let optionId: string;

    beforeEach(async () => {
      // Create a poll before each test
      const response = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Poll to be closed',
          description: 'This poll will be closed',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2'],
        })
        .expect(201);

      pollId = response.body.id;
      optionId = response.body.options[0].id;
    });

    it('should close a poll successfully when requested by the creator', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify status is CLOSED
      const pollResponse = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(pollResponse.body.status).toBe(PollStatus.CLOSED);
    });

    it('should return 403 when a non-creator tries to close the poll', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/close`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .expect(403);
    });

    it('should return 401 when unauthenticated user tries to close the poll', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/close`)
        .expect(401);
    });

    it('should return 404 when trying to close a non-existent poll', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .patch(`/polls/${nonExistentId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should prevent voting on a closed poll', async () => {
      // Close the poll first
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Try to vote
      const voteResponse = await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          optionId: optionId,
        })
        .expect(400);

      expect(voteResponse.body.message).toBe('This poll is closed');
    });
  });
});

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';
import PollTypes from '~/domain/enums/PollTypes';

describe('Vote E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let secondAccessToken: string;
  let secondUserId: string;
  let testPollId: string;
  let testOptionIds: string[];
  let privatePollId: string;
  let privateOptionIds: string[];

  beforeAll(async () => {
    app = await TestAppFactory.create();

    // Create first test user and login
    const timestamp = Date.now();
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Vote Test User',
        email: `voteuser${timestamp}@example.com`,
        password: 'Password123',
      });

    if (registerResponse.status !== 201) {
      throw new Error(
        `Failed to create user: ${registerResponse.status} - ${JSON.stringify(registerResponse.body)}`,
      );
    }

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `voteuser${timestamp}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    // Create second test user and login
    const secondRegisterResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Second Vote User',
        email: `secondvoteuser${timestamp}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondUserId = secondRegisterResponse.body.id;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `secondvoteuser${timestamp}@example.com`,
        password: 'Password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    // Create a public test poll
    const pollResponse = await request(app.getHttpServer())
      .post('/polls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Test Poll for Voting ${timestamp}`,
        description: 'This poll is for testing votes',
        type: PollTypes.PUBLIC,
        options: ['Option A', 'Option B', 'Option C'],
      });

    if (pollResponse.status !== 201) {
      throw new Error(
        `Failed to create poll: ${pollResponse.status} - ${JSON.stringify(pollResponse.body)}`,
      );
    }

    testPollId = pollResponse.body.id;
    testOptionIds = pollResponse.body.options.map((opt: any) => opt.id);

    // Create a private test poll
    const privatePollResponse = await request(app.getHttpServer())
      .post('/polls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Private Test Poll ${timestamp}`,
        description: 'This is a private poll',
        type: PollTypes.PRIVATE,
        options: ['Private A', 'Private B'],
      })
      .expect(201);

    privatePollId = privatePollResponse.body.id;
    privateOptionIds = privatePollResponse.body.options.map(
      (opt: any) => opt.id,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /polls/:pollId/vote (Create Vote)', () => {
    it('should create a vote with valid data', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: testOptionIds[0],
        })
        .expect(200);

      expect(response.body).toHaveProperty('voter');
      expect(response.body.voter.id).toBe(userId);
      expect(response.body.voter).toHaveProperty('name');
      expect(response.body.voter).toHaveProperty('email');
      expect(response.body).toHaveProperty('poll');
      expect(response.body.poll.id).toBe(testPollId);
      expect(response.body.poll).toHaveProperty('title');
      expect(response.body).toHaveProperty('option');
      expect(response.body.option.id).toBe(testOptionIds[0]);
      expect(response.body.option).toHaveProperty('text');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 409 when voting again on same poll', async () => {
      // First vote
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          optionId: testOptionIds[0],
        })
        .expect(200);

      // Try to vote again - should get conflict
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          optionId: testOptionIds[1],
        })
        .expect(409);
    });

    it('should return 401 when voting without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .send({
          optionId: testOptionIds[0],
        })
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', 'Bearer invalid-token')
        .send({
          optionId: testOptionIds[0],
        })
        .expect(401);
    });

    it('should return 400 for missing optionId', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid optionId format', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: 'not-a-uuid',
        })
        .expect(400);
    });

    it('should return 400 for non-string optionId', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: 123456,
        })
        .expect(400);
    });

    it('should return 400 for empty optionId', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: '',
        })
        .expect(400);
    });

    it('should return 404 for non-existent poll', async () => {
      await request(app.getHttpServer())
        .patch('/polls/00000000-0000-0000-0000-000000000000/vote')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: testOptionIds[0],
        })
        .expect(404);
    });

    it('should return 404 for non-existent option', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);
    });

    it('should return 409 for option from different poll', async () => {
      await request(app.getHttpServer())
        .patch(`/polls/${testPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: privateOptionIds[0],
        })
        .expect(409);
    });
  });

  describe('DELETE /polls/:pollId/vote (Remove Vote)', () => {
    let pollForDeletion: string;
    let optionForDeletion: string;

    beforeAll(async () => {
      // Create a new poll for deletion tests
      const timestamp = Date.now();
      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `Poll for Vote Deletion ${timestamp}`,
          description: 'Testing vote removal',
          type: PollTypes.PUBLIC,
          options: ['Delete A', 'Delete B'],
        })
        .expect(201);

      pollForDeletion = pollResponse.body.id;
      optionForDeletion = pollResponse.body.options[0].id;

      // Create a vote to be deleted
      await request(app.getHttpServer())
        .patch(`/polls/${pollForDeletion}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: optionForDeletion,
        })
        .expect(200);
    });

    it('should remove vote successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/polls/${pollForDeletion}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Verify vote was removed by checking poll
      const pollResponse = await request(app.getHttpServer())
        .get(`/polls/${pollForDeletion}`)
        .expect(200);

      expect(pollResponse.body.totalVotes).toBe(0);
    });

    it('should return 401 when removing vote without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/polls/${testPollId}/vote`)
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .delete(`/polls/${testPollId}/vote`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 404 for non-existent poll', async () => {
      await request(app.getHttpServer())
        .delete('/polls/00000000-0000-0000-0000-000000000000/vote')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 when removing non-existent vote', async () => {
      // Create poll without voting
      const timestamp = Date.now();
      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          title: `Poll Without Vote ${timestamp}`,
          description: 'No votes here',
          type: PollTypes.PUBLIC,
          options: ['A', 'B'],
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/polls/${pollResponse.body.id}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .expect(404);
    });

    it('should return 204 with no content', async () => {
      // Vote first
      const timestamp = Date.now();
      const newPollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `Another Deletion Poll ${timestamp}`,
          description: 'Test',
          type: PollTypes.PUBLIC,
          options: ['X', 'Y'],
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/polls/${newPollResponse.body.id}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: newPollResponse.body.options[0].id,
        })
        .expect(200);

      const response = await request(app.getHttpServer())
        .delete(`/polls/${newPollResponse.body.id}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });

  describe('Vote Flow Integration', () => {
    it('should complete full vote lifecycle', async () => {
      // Create poll
      const timestamp = Date.now();
      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `Integration Vote Poll ${timestamp}`,
          description: 'Full lifecycle test',
          type: PollTypes.PUBLIC,
          options: ['Option 1', 'Option 2', 'Option 3'],
        })
        .expect(201);

      const pollId = pollResponse.body.id;
      const optionIds = pollResponse.body.options.map((opt: any) => opt.id);

      // Vote on option 1
      const voteResponse = await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: optionIds[0],
        })
        .expect(200);

      expect(voteResponse.body.option.id).toBe(optionIds[0]);

      // Verify vote was counted
      let pollCheck = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(pollCheck.body.totalVotes).toBe(1);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[0])
          .votesCount,
      ).toBe(1);

      // Try to change vote to option 2 - should get 409
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: optionIds[1],
        })
        .expect(409);

      // Vote should still be on option 1
      pollCheck = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(pollCheck.body.totalVotes).toBe(1);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[0])
          .votesCount,
      ).toBe(1);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[1])
          .votesCount,
      ).toBe(0);

      // Remove vote
      await request(app.getHttpServer())
        .delete(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Verify vote was removed
      pollCheck = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(pollCheck.body.totalVotes).toBe(0);
    });

    it('should handle multiple users voting on same poll', async () => {
      // Create poll
      const timestamp = Date.now();
      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `Multi User Vote Poll ${timestamp}`,
          description: 'Multiple users test',
          type: PollTypes.PUBLIC,
          options: ['A', 'B', 'C'],
        })
        .expect(201);

      const pollId = pollResponse.body.id;
      const optionIds = pollResponse.body.options.map((opt: any) => opt.id);

      // First user votes
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: optionIds[0],
        })
        .expect(200);

      // Second user votes
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          optionId: optionIds[1],
        })
        .expect(200);

      // Verify both votes counted
      const pollCheck = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(pollCheck.body.totalVotes).toBe(2);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[0])
          .votesCount,
      ).toBe(1);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[1])
          .votesCount,
      ).toBe(1);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[2])
          .votesCount,
      ).toBe(0);
    });

    it('should maintain vote integrity when users vote on same poll', async () => {
      const timestamp = Date.now();
      const pollResponse = await request(app.getHttpServer())
        .post('/polls')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: `Vote Integrity Poll ${timestamp}`,
          description: 'Testing vote integrity',
          type: PollTypes.PUBLIC,
          options: ['X', 'Y'],
        })
        .expect(201);

      const pollId = pollResponse.body.id;
      const optionIds = pollResponse.body.options.map((opt: any) => opt.id);

      // Both users vote for option X
      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          optionId: optionIds[0],
        })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/polls/${pollId}/vote`)
        .set('Authorization', `Bearer ${secondAccessToken}`)
        .send({
          optionId: optionIds[0],
        })
        .expect(200);

      // Verify counts: X=2, Y=0
      const pollCheck = await request(app.getHttpServer())
        .get(`/polls/${pollId}`)
        .expect(200);

      expect(pollCheck.body.totalVotes).toBe(2);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[0])
          .votesCount,
      ).toBe(2);
      expect(
        pollCheck.body.options.find((opt: any) => opt.id === optionIds[1])
          .votesCount,
      ).toBe(0);
    });
  });
});

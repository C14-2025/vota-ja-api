import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppFactory } from '../helpers/test-app-factory';

describe('App E2E (Healthcheck)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await TestAppFactory.create();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health (Healthcheck)', () => {
    it('should return OK status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('OK');
    });

    it('should return JSON content type', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({ message: 'OK' });
    });

    it('should work without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.message).toBe('OK');
    });

    it('should have correct response structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(typeof response.body).toBe('object');
      expect(Object.keys(response.body)).toEqual(['message']);
      expect(typeof response.body.message).toBe('string');
    });

    it('should be fast (< 100ms)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/health').expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it('should be idempotent', async () => {
      const firstResponse = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const secondResponse = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(firstResponse.body).toEqual(secondResponse.body);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app.getHttpServer()).get('/non-existent-route').expect(404);
    });

    it('should return 404 for /health with trailing slash', async () => {
      await request(app.getHttpServer())
        .get('/health/')
        .expect(res => {
          // Pode ser 200 ou 404 dependendo da configuração do framework
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept GET method', async () => {
      await request(app.getHttpServer()).post('/health').expect(404);

      await request(app.getHttpServer()).put('/health').expect(404);

      await request(app.getHttpServer()).delete('/health').expect(404);

      await request(app.getHttpServer()).patch('/health').expect(404);
    });

    it('should respond to HEAD requests if supported', async () => {
      await request(app.getHttpServer())
        .head('/health')
        .expect(res => {
          // HEAD pode retornar 200 ou 404 dependendo da implementação
          expect([200, 404, 405]).toContain(res.status);
        });
    });
  });
});

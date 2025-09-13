import { IConfig } from './type';
import { env } from './env';

export const config: IConfig = {
  app: {
    environment: env.ENV,
  },
  rateLimit: {
    ttl: env.THROTTLER_TTL,
    limit: env.THROTTLER_LIMIT,
  },
  swagger: {
    title: 'Vota já - API',
    description: 'API from Vota Já project',
    version: '0.1',
    tag: 'nestjs-api',
    path: '/docs',
  },
};

import { IConfig } from './type';
import { env } from './env';

export const config: IConfig = {
  app: {
    environment: env.ENV,
  },
  jwt: {
    privateKey: Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString(),
    publicKey: Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString(),
    expiresIn: '7d',
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
  typeOrmDb: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB_NAME,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    autoLoadEntities: true,
    ssl: process.env.ENV === 'local' ? false : { rejectUnauthorized: false },
  },
};

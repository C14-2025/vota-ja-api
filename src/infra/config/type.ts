import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import Environment from '~/domain/interfaces/Environment';

export interface IConfig {
  app: {
    environment: Environment;
  };
  rateLimit: {
    ttl: number;
    limit: number;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
    tag: string;
    path: string;
  };
  jwt: {
    privateKey: string;
    publicKey: string;
    expiresIn: string;
  };
  typeOrmDb: TypeOrmModuleOptions;
}

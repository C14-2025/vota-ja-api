import Environment from 'types/Environment';

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
}

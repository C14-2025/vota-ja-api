import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export class TestDatabase {
  private static container: StartedPostgreSqlContainer;

  static async start(): Promise<void> {
    if (this.container) {
      return;
    }

    console.log('Starting PostgreSQL TestContainer...');

    this.container = await new PostgreSqlContainer('bitnami/postgresql')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .withExposedPorts(5432)
      .start();

    process.env.POSTGRES_HOST = this.container.getHost();
    process.env.POSTGRES_PORT = this.container.getPort().toString();
    process.env.POSTGRES_USER = this.container.getUsername();
    process.env.POSTGRES_PASS = this.container.getPassword();
    process.env.POSTGRES_DB_NAME = this.container.getDatabase();
    process.env.TYPEORM_SYNCHRONIZE = 'true';
    process.env.APP_ENV = 'testing';
    process.env.ENVIRONMENT = 'testing';

    console.log(
      `PostgreSQL with PostGIS started at ${this.container.getHost()}:${this.container.getPort()}`,
    );
  }

  static async stop(): Promise<void> {
    if (this.container) {
      console.log('Stopping PostgreSQL TestContainer...');
      await this.container.stop();
    }
  }

  static getConnectionUri(): string {
    if (!this.container) {
      throw new Error('Container not started');
    }
    return this.container.getConnectionUri();
  }
}

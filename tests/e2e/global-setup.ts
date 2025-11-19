import * as dotenv from 'dotenv';
import * as path from 'path';
import { TestDatabase } from './helpers/test-database';

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

  await Promise.all([TestDatabase.start()]);
}

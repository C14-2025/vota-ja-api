import 'dotenv/config';

import Environment from '~/domain/interfaces/Environment';
import { z } from 'zod';

export const envSchema = z.object({
  THROTTLER_TTL: z.coerce.number().min(1, 'THROTTLER_TTL is required'),
  THROTTLER_LIMIT: z.coerce.number().min(1, 'THROTTLER_LIMIT is required'),
  ENV: z.enum(Environment, 'ENV has to be valid'),
});

export type Env = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', z.prettifyError(_env.error));
  process.exit(1);
}

export const env: Env = _env.data;

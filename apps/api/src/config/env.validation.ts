import { z } from 'zod';

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection URL'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES: z.string().default('7d'),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  ACCOUNT_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
  THROTTLER_TTL: z.coerce.number().int().positive().default(60),
  THROTTLER_LIMIT: z.coerce.number().int().positive().default(10),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = environmentSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

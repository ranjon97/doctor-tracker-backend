import { existsSync } from 'node:fs';
import { z } from 'zod';

// Load .env for local development. Hosting platforms inject variables directly.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(24),
  CLIENT_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
  APP_TIMEZONE: z.string().default('Asia/Dhaka'),
  SEED_ADMIN_NAME: z.string().default('Admin User'),
  SEED_ADMIN_EMAIL: z.string().default('admin@doctortracker.com'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('Admin@12345'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const values = parsed.data;

export const env = {
  ...values,
  isProduction: values.NODE_ENV === 'production',
  clientOrigins: values.CLIENT_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  sessionTtlSeconds: values.SESSION_TTL_HOURS * 60 * 60,
} as const;

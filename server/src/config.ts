import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000), NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'), MONGODB_URI: z.string().min(1),
  PAYSTACK_SECRET_KEY: z.string().min(1), PAYSTACK_PUBLIC_KEY: z.string().min(1), JWT_SECRET: z.string().min(32), TICKET_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(), ADMIN_PASSWORD: z.string().min(12),
  SMTP_HOST: z.string().default('smtp.gmail.com'), SMTP_PORT: z.coerce.number().default(465), SMTP_SECURE: z.string().default('true'), SMTP_USER: z.string().email(), SMTP_PASS: z.string().min(1), EMAIL_FROM: z.string().min(1), PUBLIC_SITE_URL: z.string().url(),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) throw new Error(`Invalid environment configuration:\n${parsed.error.issues.map(issue => `- ${issue.path.join('.')}: ${issue.message}`).join('\n')}`);
export const config = parsed.data;
export const isProduction = config.NODE_ENV === 'production';

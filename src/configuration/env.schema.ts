import { z } from 'zod';

export const envSchema = z.object({
  // app
  API_KEY: z.string(),
  PORT: z.coerce.number(),
  // database
  DATABASE_URL: z.string({
    required_error: '😱 You forgot to add a database URL',
  }),
  MYSQL_DATABASE: z.string(),
  MYSQL_USERNAME: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_PORT: z.coerce.number(),
  MYSQL_HOST: z.string(),
  // jwt tokens
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION: z.string(),
  JWT_RESET_PASSWORD_SECRET: z.string(),
  JWT_RESET_PASSWORD_EXPIRATION: z.string(),
  // mail
  MAIL_HOST: z.string(),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_FROM: z.string().email('MAIL_FROM must be a valid email'),
  // google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  // rate limiting
  THROTTLER_SHORT_TTL: z.coerce.number(),
  THROTTLER_SHORT_LIMIT: z.coerce.number(),
  // frontend url
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
});
export type Env = z.infer<typeof envSchema>;

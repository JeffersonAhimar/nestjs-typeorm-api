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
});
export type Env = z.infer<typeof envSchema>;

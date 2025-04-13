import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    apiKey: process.env.API_KEY,
    port: parseInt(process.env.PORT),
    mysql: {
      database: process.env.MYSQL_DATABASE,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      port: parseInt(process.env.MYSQL_PORT),
      host: process.env.MYSQL_HOST,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiration: process.env.JWT_EXPIRATION,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
      resetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET,
      resetPasswordExpiration: process.env.JWT_RESET_PASSWORD_EXPIRATION,
    },
    mail: {
      host: process.env.MAIL_HOST,
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
      from: process.env.MAIL_FROM,
    },
    googleOauth: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    throttler: {
      shortTTL: parseInt(process.env.THROTTLER_SHORT_TTL),
      shortLIMIT: parseInt(process.env.THROTTLER_SHORT_LIMIT),
    },
    frontendURL: process.env.FRONTEND_URL,
  };
});

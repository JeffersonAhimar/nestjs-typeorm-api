import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from './config.service';
import { envSchema } from './env.schema';
import configuration from './configuration';
import { environments } from './environments';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || environments.dev,
      load: [configuration],
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
  ],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}

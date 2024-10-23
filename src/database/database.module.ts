import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';

import configuration from 'src/configuration/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [configuration.KEY],
      useFactory: (configService: ConfigType<typeof configuration>) => {
        const { host, port, username, password, database } =
          configService.mysql;
        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          synchronize: false, // true only for dev environment
          autoLoadEntities: true,
        };
      },
    }),
  ],
  // exports: [TypeOrmModule],
})
export class DatabaseModule {}

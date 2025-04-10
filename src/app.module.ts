import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { RolesModule } from './roles/roles.module';
import { UsersRolesModule } from './users-roles/users-roles.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ExcelModule } from './excel/excel.module';
import { PdfModule } from './pdf/pdf.module';
import { MailsModule } from './mails/mails.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './configuration/configuration';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    UsersModule,
    PostsModule,
    RolesModule,
    UsersRolesModule,
    AuthModule,
    FilesModule,
    ExcelModule,
    PdfModule,
    MailsModule,
    ThrottlerModule.forRootAsync({
      inject: [configuration.KEY],
      useFactory: async (configService: ConfigType<typeof configuration>) => ({
        throttlers: [
          {
            ttl: configService.throttler.shortTTL,
            limit: configService.throttler.shortLIMIT,
          },
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: ThrottlerGuard,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

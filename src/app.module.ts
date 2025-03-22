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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

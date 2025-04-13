import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigType } from '@nestjs/config';
import { join } from 'path';
import configuration from 'src/configuration/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [configuration.KEY],
      useFactory: async (configService: ConfigType<typeof configuration>) => ({
        transport: {
          host: configService.mail.host,
          secure: false,
          auth: {
            user: configService.mail.user,
            pass: configService.mail.password,
          },
        },
        defaults: {
          from: `No Reply <${configService.mail.from}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [MailsController],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}

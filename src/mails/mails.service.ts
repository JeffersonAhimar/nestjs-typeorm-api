import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailsService {
  constructor(private mailerService: MailerService) {}
  async create(createMailDto: CreateMailDto) {
    const { emailTo, nameTo, url } = createMailDto;

    try {
      await this.mailerService.sendMail({
        to: emailTo,
        subject: 'Hello world',
        template: './welcome',
        context: {
          name: nameTo,
          url: url,
        },
      });
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.message) {
        errorMessage = error.message;
      }

      throw new BadRequestException(`Error sending email: ${errorMessage}`);
    }

    return `The email was sent to ${emailTo}`;
  }
}

import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { MailsService } from './mails.service';
import { CreateMailDto } from './dto/create-mail.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Public()
  @Post()
  async create(@Body() createMailDto: CreateMailDto) {
    const message = await this.mailsService.create(createMailDto);
    return { statusCode: HttpStatus.CREATED, message };
  }
}

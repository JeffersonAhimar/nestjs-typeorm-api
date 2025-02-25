import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({
    description: 'File to upload',
    type: 'string',
    format: 'binary',
    required: false,
  })
  readonly file?: any;
}

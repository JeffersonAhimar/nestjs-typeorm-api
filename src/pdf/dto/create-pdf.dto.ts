import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePdfDto {
  @ApiProperty()
  @IsString()
  @Length(6)
  @IsNotEmpty()
  readonly title: string;
}

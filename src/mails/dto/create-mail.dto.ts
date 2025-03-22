import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateMailDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  readonly emailTo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly nameTo: string;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  readonly url: string;
}

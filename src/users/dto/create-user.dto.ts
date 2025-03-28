import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsDate,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ description: 'the email of user' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @Length(6)
  @IsNotEmpty()
  readonly password: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(7, 20)
  @IsOptional()
  readonly identityNumber?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1999-12-24' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  readonly dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  readonly avatarUrl?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, Length, IsDate } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  @Length(7, 20)
  readonly identityNumber: string;

  @ApiProperty({ description: 'Date of birth', example: '1999-12-24' })
  @Type(() => Date)
  @IsDate()
  readonly dateOfBirth: Date;
}

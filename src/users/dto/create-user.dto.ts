import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';

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
}

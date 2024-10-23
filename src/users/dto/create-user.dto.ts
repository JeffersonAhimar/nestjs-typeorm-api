import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @Length(6)
  @IsNotEmpty()
  readonly password: string;
}

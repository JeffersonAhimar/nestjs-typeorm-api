import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsString()
  @Length(6)
  @IsNotEmpty()
  readonly newPassword: string;
}

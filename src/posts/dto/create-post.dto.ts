import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

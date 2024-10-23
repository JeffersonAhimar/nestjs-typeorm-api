import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

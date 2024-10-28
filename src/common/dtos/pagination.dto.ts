import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

export class PaginationDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  skip: number; // offset

  @IsNumber()
  @IsPositive()
  @IsOptional()
  take: number = DEFAULT_PAGE_SIZE; // limit
}

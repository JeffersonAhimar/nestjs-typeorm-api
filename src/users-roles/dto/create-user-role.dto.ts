import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class CreateUserRoleDto {
  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  readonly roleId: number;
}

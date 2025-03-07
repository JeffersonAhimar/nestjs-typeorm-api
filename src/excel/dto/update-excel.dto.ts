import { PartialType } from '@nestjs/swagger';
import { CreateExcelDto } from './create-excel.dto';

export class UpdateExcelDto extends PartialType(CreateExcelDto) {}

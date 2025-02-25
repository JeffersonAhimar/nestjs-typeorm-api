import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseFilters,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { createMulterOptions } from 'src/common/config/multer.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from './dto/create-file.dto';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';

@ApiBearerAuth('accessToken')
@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Post('upload-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFileDto })
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMulterOptions('uploads/images', 1, ['image/jpeg', 'image/png']),
    ),
  )
  @UseFilters(MulterExceptionFilter)
  uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.filesService.handleFileUpload(file);
  }

  @Public()
  @Post('upload-document')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFileDto })
  @UseInterceptors(
    FileInterceptor(
      'file',
      createMulterOptions('uploads/documents', 2, ['application/pdf']),
    ),
  )
  @UseFilters(MulterExceptionFilter)
  uploadDocument(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.filesService.handleFileUpload(file);
  }
}

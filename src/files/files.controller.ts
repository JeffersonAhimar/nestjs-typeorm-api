import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpStatus,
  Get,
  Param,
  Res,
  Delete,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { createMulterOptions } from 'src/common/config/multer.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from './dto/create-file.dto';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
import { Response } from 'express';

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

  @Public()
  @Post('upload-to-s3')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateFileDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadToS3(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 }),
          // new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // console.log(file);
    const result = await this.filesService.uploadFileToS3(file, false);
    return {
      statusCode: HttpStatus.CREATED,
      ...result,
    };
  }

  @Public()
  @Get('download-from-s3/:key(*)') // (*) To handle slashes in the URL for folder-like structure in S3
  async downloadFromS3(@Param('key') key: string, @Res() res: Response) {
    const fileStream = await this.filesService.getS3File(key);
    // Set HTTP headers for PDF response
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);

    fileStream.pipe(res);
  }

  @Public()
  @Delete('delete-from-s3/:key(*)')
  async deleteFromS3(@Param('key') key: string) {
    const result = await this.filesService.deleteS3File(key);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}

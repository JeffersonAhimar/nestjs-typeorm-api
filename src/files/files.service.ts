import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return { message: 'File uploaded successfully', filePath: file.path };
  }
}

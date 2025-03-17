import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiBearerAuth('accessToken')
@ApiTags('pdf')
@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Get('generate-pdf-file')
  async generatePdfFile(@Query() createPdfDto: CreatePdfDto) {
    const content = 'This is a PDF document generated in NestJS.';
    const imagePath = 'src/assets/background.jpg'; // Optional image

    const filePath = await this.pdfService.generatePdfFile(
      createPdfDto,
      content,
      imagePath,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'PDF generated successfully',
      path: filePath,
    };
  }

  @Public()
  @Get('generate-pdf-download')
  async generatePdfDownload(
    @Query() createPdfDto: CreatePdfDto,
    @Res() res: Response,
  ) {
    const content = 'This is a PDF document generated in NestJS.';
    const imagePath = 'src/assets/background.jpg'; // Optional image

    // Set HTTP headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${Date.now()}_${createPdfDto.title}.pdf"`,
    );

    const pdfStream = await this.pdfService.generatePdfStream(
      createPdfDto,
      content,
      imagePath,
    );
    pdfStream.pipe(res);
  }
}

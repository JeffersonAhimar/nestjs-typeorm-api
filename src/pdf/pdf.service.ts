import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';

import { CreatePdfDto } from './dto/create-pdf.dto';
import { Stream } from 'stream';

@Injectable()
export class PdfService {
  private createPdfDocument(
    createPdfDto: CreatePdfDto,
    content: string,
    imagePath?: string,
  ): PDFKit.PDFDocument {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Add background image if provided
    if (imagePath) {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      doc.image(imagePath, 0, 0, { width: pageWidth, height: pageHeight });
    }

    // Add title and content
    doc.fontSize(20).text(createPdfDto.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(content, { align: 'justify' });

    return doc;
  }

  async generatePdfFile(
    createPdfDto: CreatePdfDto,
    content: string,
    imagePath?: string,
  ) {
    try {
      const folderPath = './uploads/pdfs/';
      const fileName = `${Date.now()}_${createPdfDto.title}.pdf`;
      const outputPath = `${folderPath}${fileName}`;

      // ✅ Ensure the directory exists before writing the file
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const doc = this.createPdfDocument(createPdfDto, content, imagePath);

      // Create a writable stream to save the PDF file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      doc.end();

      // Wait for the file to be written before returning
      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', (err) =>
          reject(new InternalServerErrorException(err.message)),
        );
      });
    } catch (error) {
      throw new InternalServerErrorException('Error generating the PDF file');
    }
  }

  async generatePdfStream(
    createPdfDto: CreatePdfDto,
    content: string,
    imagePath?: string,
  ) {
    try {
      const doc = this.createPdfDocument(createPdfDto, content, imagePath);

      // Create a PassThrough stream to hold the PDF data in memory
      const stream = new Stream.PassThrough();
      doc.pipe(stream);
      doc.end();

      return stream;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error generating the PDF for download',
      );
    }
  }
}

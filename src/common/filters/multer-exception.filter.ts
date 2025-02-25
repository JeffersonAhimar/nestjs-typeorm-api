import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // console.log(exception);

    // PayloadTooLargeException
    if (exception.status === HttpStatus.PAYLOAD_TOO_LARGE) {
      const maxFileSizeMB = request.maxFileSizeMB || 1;
      return response.status(413).json({
        statusCode: 413,
        message: `File is too large. Max allowed size: ${maxFileSizeMB}MB.`,
      });
    }

    // Other exceptions
    const genericStatusCode = exception.status || 400;
    return response.status(genericStatusCode).json({
      statusCode: genericStatusCode,
      message: exception.message || 'Error uploading file',
    });
  }
}

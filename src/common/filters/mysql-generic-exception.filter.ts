import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { TypeORMQueryError } from '../interfaces/typeorm-query-error.interface';

@Catch(QueryFailedError)
export class MysqlGenericExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;
    const driverError = exception.driverError as TypeORMQueryError;

    response.status(status).json({
      statusCode: status,
      message: driverError.sqlMessage ?? 'Database error occurred.',
      error: {
        code: driverError.code ?? '00', // ER_DATA_TOO_LONG, etc.
        errno: driverError.errno ?? '00', // 1406, 1048, etc.
      },
    });
  }
}

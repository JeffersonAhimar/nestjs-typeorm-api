import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { TypeORMQueryError } from '../interfaces/typeorm-query-error.interface';

class QueryError {
  static [Symbol.hasInstance](instance: TypeORMQueryError): boolean {
    return instance instanceof QueryFailedError && instance.errno === 1451; // change # error
  }
}

@Catch(QueryError)
// change # error
export class Mysql1451ExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;
    const driverError = exception.driverError as TypeORMQueryError;

    response.status(status).json({
      statusCode: status,
      message: driverError.sqlMessage,
    });
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { HTTP_Status } from './main/types/enums';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (status === HTTP_Status.BAD_REQUEST_400) {
      const errorsMessages = exception.getResponse();
      response.status(status).json({ errorsMessages });
    } else {
      response.status(status).json({ message: exception.message });
    }
  }
}

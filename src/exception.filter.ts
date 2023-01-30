import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { HTTP_Status } from './main/types/enums';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (status === HTTP_Status.BAD_REQUEST_400) {
        const messages: any = exception.getResponse();
        response.status(status).json({ errorsMessages: messages.message });
      } else {
        response.status(status).json({ message: exception.message });
      }
    } else {
      if (!!'production') {
        console.log(`! ${exception.name} - ${exception.message}`);
        response.status(500).json({ message: exception.message, field: exception.stack });
      } else {
        response.status(500).json('You crash the server! I`ll find You!');
      }
    }
  }
}

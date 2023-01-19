import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AttemptsService } from '../auth/application/attempts-service';
import { AttemptsDataDto } from '../auth/application/dto/AttemptsDataDto';
import { HTTP_Status } from './types/enums';

@Injectable()
export class AttemptsValidationMiddleware implements NestMiddleware {
  constructor(protected attemptsService: AttemptsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const dto: AttemptsDataDto = {
      ip: req.ip,
      url: req.url,
    };

    await this.attemptsService.addAttemptToList(dto);

    const countAttempts = await this.attemptsService.findAttempts(dto);
    if (countAttempts > 5) throw new HttpException('too many attempts', HTTP_Status.TOO_MANY_REQUESTS_429);
    next();
  }
}

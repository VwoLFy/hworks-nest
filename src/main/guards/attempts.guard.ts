import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AttemptsDataDto } from '../../auth/application/dto/AttemptsDataDto';
import { HTTP_Status } from '../types/enums';
import { AttemptsService } from '../../auth/application/attempts-service';

@Injectable()
export class AttemptsGuard implements CanActivate {
  constructor(protected attemptsService: AttemptsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const dto: AttemptsDataDto = {
      ip: req.ip,
      url: req.url,
    };

    await this.attemptsService.addAttemptToList(dto);

    const countAttempts = await this.attemptsService.findAttempts(dto);
    if (countAttempts > 5) throw new HttpException('too many attempts', HTTP_Status.TOO_MANY_REQUESTS_429);
    return true;
  }
}

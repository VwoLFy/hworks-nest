import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AttemptsDataDto } from '../../application/dto/AttemptsDataDto';
import { HTTP_Status } from '../../../../main/types/enums';
import { AttemptsService } from '../../application/attempts.service';
import { ApiConfigService } from '../../../../main/configuration/api.config.service';

@Injectable()
export class AttemptsGuard implements CanActivate {
  constructor(protected attemptsService: AttemptsService, protected apiConfigService: ApiConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const intervalInSeconds = this.apiConfigService.ATTEMPTS_INTERVAL;

    const dto: AttemptsDataDto = {
      ip: req.ip,
      url: req.url,
    };

    const countAttempts = await this.attemptsService.countAttempts(dto, intervalInSeconds);
    if (countAttempts > 5) throw new HttpException('too many attempts', HTTP_Status.TOO_MANY_REQUESTS_429);
    return true;
  }
}

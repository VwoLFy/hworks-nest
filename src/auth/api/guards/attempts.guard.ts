import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AttemptsDataDto } from '../../application/dto/AttemptsDataDto';
import { HTTP_Status } from '../../../main/types/enums';
import { CountAttemptsUseCase } from '../../application/use-cases/count-attempts-use-case';

@Injectable()
export class AttemptsGuard implements CanActivate {
  constructor(protected countAttemptsUseCase: CountAttemptsUseCase) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const dto: AttemptsDataDto = {
      ip: req.ip,
      url: req.url,
    };

    const countAttempts = await this.countAttemptsUseCase.execute(dto, 10);
    if (countAttempts > 5) throw new HttpException('too many attempts', HTTP_Status.TOO_MANY_REQUESTS_429);
    return true;
  }
}

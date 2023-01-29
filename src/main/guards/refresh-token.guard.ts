import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { GetDataIfSessionIsActiveUseCase } from '../../security/application/use-cases/get-data-if-session-is-active-use-case';
import { SessionDto } from '../../security/application/dto/SessionDto';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(protected getDataIfSessionIsActiveUseCase: GetDataIfSessionIsActiveUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const sessionData: SessionDto | null = await this.getDataIfSessionIsActiveUseCase.execute(req.cookies.refreshToken);
    if (!sessionData) throw new UnauthorizedException();

    req.sessionData = sessionData;
    return true;
  }
}

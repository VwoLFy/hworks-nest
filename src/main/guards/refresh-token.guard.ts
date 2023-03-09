import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionDto } from '../../modules/security/application/dto/SessionDto';
import { SecurityService } from '../../modules/security/application/security.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(protected securityService: SecurityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const sessionData: SessionDto | null = await this.securityService.getDataIfSessionIsActive(
      req.cookies.refreshToken,
    );
    if (!sessionData) throw new UnauthorizedException();

    req.sessionData = sessionData;
    return true;
  }
}

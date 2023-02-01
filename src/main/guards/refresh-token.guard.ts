import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionDto } from '../../modules/security/application/dto/SessionDto';
import { ApiJwtService } from '../../modules/auth/application/api-jwt.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(protected apiJwtService: ApiJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const sessionData: SessionDto | null = await this.apiJwtService.getDataIfSessionIsActive(req.cookies.refreshToken);
    if (!sessionData) throw new UnauthorizedException();

    req.sessionData = sessionData;
    return true;
  }
}

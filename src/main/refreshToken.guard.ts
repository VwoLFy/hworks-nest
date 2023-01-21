import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppJwtService, RefreshTokenDataType } from '../auth/application/jwt-service';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(protected jwtService: AppJwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const refreshTokenData: RefreshTokenDataType | null = await this.jwtService.checkAndGetRefreshTokenData(
      req.cookies.refreshToken,
    );
    if (!refreshTokenData) throw new UnauthorizedException();

    req.refreshTokenData = refreshTokenData;
    return true;
  }
}

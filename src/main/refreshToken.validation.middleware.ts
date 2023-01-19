import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AppJwtService, RefreshTokenDataType } from '../auth/application/jwt-service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RefreshTokenValidationMiddleware implements NestMiddleware {
  constructor(protected jwtService: AppJwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const refreshTokenData: RefreshTokenDataType | null = await this.jwtService.checkAndGetRefreshTokenData(
      req.cookies.refreshToken,
    );
    if (!refreshTokenData) throw new UnauthorizedException();

    req.refreshTokenData = refreshTokenData;
    next();
  }
}

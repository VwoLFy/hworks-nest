import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppJwtService } from '../auth/application/jwt-service';

@Injectable()
export class getUserIdAuthMiddleware implements NestMiddleware {
  constructor(protected jwtService: AppJwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      const userId = await this.jwtService.getUserIdByAccessToken(accessToken);
      if (userId) req.userId = userId;
    }
    next();
  }
}

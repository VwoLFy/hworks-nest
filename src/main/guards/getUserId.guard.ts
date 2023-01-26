import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiJwtService } from '../../auth/application/jwt-service';
import { Request } from 'express';

@Injectable()
export class GetUserIdGuard implements CanActivate {
  constructor(protected jwtService: ApiJwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    let userId = null;
    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }
    req.userId = userId;
    return true;
  }
}

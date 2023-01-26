import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { atob } from 'buffer';
import { ApiJwtService } from '../../auth/application/jwt-service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected jwtService: ApiJwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;

    if (!authorization) throw new UnauthorizedException();
    if (authorization.startsWith('Basic')) {
      try {
        const [login, pass] = atob(authorization.split(' ')[1]).split(':');

        if (login !== 'admin' || pass !== 'qwerty') throw new UnauthorizedException();
        return true;
      } catch (e) {
        throw new UnauthorizedException();
      }
    } else if (authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      const userId = await this.jwtService.getUserIdByAccessToken(accessToken);
      if (!userId) throw new UnauthorizedException();
      req.userId = userId;
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}

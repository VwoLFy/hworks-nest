import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiJwtService } from '../../auth/application/jwt-service';

@Injectable()
export class GetUserIdGuard implements CanActivate {
  constructor(protected jwtService: ApiJwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    let userId = null;
    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      userId = await this.jwtService.getUserIdByAccessToken(accessToken);
    }
    req.user = { userId };
    return true;
  }
}

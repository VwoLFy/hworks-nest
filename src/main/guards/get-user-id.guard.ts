import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiJwtService } from '../../modules/auth/application/api-jwt.service';

@Injectable()
export class GetUserIdGuard implements CanActivate {
  constructor(protected apiJwtService: ApiJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    let userId: string | null = null;

    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      userId = await this.apiJwtService.getUserIdByAccessToken(accessToken);
    }

    req.user = { userId };
    return true;
  }
}

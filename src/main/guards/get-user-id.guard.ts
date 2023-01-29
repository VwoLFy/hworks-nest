import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GetUserIdByAccessTokenUseCase } from '../../auth/application/use-cases/get-user-id-by-accesstoken-use-case';

@Injectable()
export class GetUserIdGuard implements CanActivate {
  constructor(protected getUserIdByAccessTokenUseCase: GetUserIdByAccessTokenUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    let userId: string | null = null;

    if (authorization && authorization.startsWith('Bearer')) {
      const accessToken = authorization.split(' ')[1];
      userId = await this.getUserIdByAccessTokenUseCase.execute(accessToken);
    }

    req.user = { userId };
    return true;
  }
}

import { ApiJwtService } from '../api-jwt.service';
import { Injectable } from '@nestjs/common';
import { TokensType } from '../types/types';
import { SecurityService } from '../../../security/application/security.service';

@Injectable()
export class LoginUserUseCase {
  constructor(protected apiJwtService: ApiJwtService, protected securityService: SecurityService) {}

  async execute(userId: string, ip: string, title: string): Promise<TokensType> {
    const tokens = await this.apiJwtService.createJWT(userId, null);
    const refreshTokenData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    await this.securityService.createSession({ ...refreshTokenData, ip, title });
    return tokens;
  }
}

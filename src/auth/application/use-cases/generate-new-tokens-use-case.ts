import { ApiJwtService } from '../api-jwt.service';
import { Injectable } from '@nestjs/common';
import { TokensType } from '../types/types';
import { SessionDto } from '../../../security/application/dto/SessionDto';
import { SecurityService } from '../../../security/application/security.service';

@Injectable()
export class GenerateNewTokensUseCase {
  constructor(protected apiJwtService: ApiJwtService, protected securityService: SecurityService) {}

  async execute(oldSessionData: SessionDto, ip: string, title: string): Promise<TokensType> {
    const tokens = await this.apiJwtService.createJWT(oldSessionData.userId, oldSessionData.deviceId);
    const newSessionData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    await this.securityService.updateSession({ ...newSessionData, ip, title });
    return tokens;
  }
}

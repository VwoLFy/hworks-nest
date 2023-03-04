import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../../../main/configuration/api.config.service';
import { AccessTokenDataType, TokensType } from './types/types';
import { SessionDto } from '../../security/application/dto/SessionDto';
import { SecurityService } from '../../security/application/security.service';

@Injectable()
export class ApiJwtService {
  constructor(
    protected securityService: SecurityService,
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
  ) {}

  async createJWT(userId: string, deviceId: string | null): Promise<TokensType> {
    const secretRT = this.apiConfigService.JWT_SECRET_FOR_REFRESHTOKEN;
    const expiresInRT = this.apiConfigService.EXPIRES_IN_TIME_OF_REFRESHTOKEN;

    const accessToken = this.jwtService.sign({ userId });

    deviceId = deviceId ? deviceId : await this.securityService.newDeviceId();
    const refreshToken = this.jwtService.sign({ userId, deviceId }, { secret: secretRT, expiresIn: expiresInRT });

    return { accessToken, refreshToken };
  }

  async getRefreshTokenData(refreshToken: string): Promise<SessionDto | null> {
    try {
      const secretRT = this.apiConfigService.JWT_SECRET_FOR_REFRESHTOKEN;
      return this.jwtService.verify(refreshToken, { secret: secretRT }) as SessionDto;
    } catch (e) {
      return null;
    }
  }

  async getUserIdByAccessToken(accessToken: string): Promise<string | null> {
    try {
      const result = this.jwtService.verify(accessToken) as AccessTokenDataType;
      return result.userId;
    } catch (e) {
      return null;
    }
  }

  async getDataIfSessionIsActive(refreshToken: string): Promise<SessionDto | null> {
    const sessionData = await this.getRefreshTokenData(refreshToken);
    if (!sessionData) return null;

    const isActiveSession = await this.securityService.isActiveSession(sessionData);
    return isActiveSession ? sessionData : null;
  }
}

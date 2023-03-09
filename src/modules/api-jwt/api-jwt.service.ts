import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../../main/configuration/api.config.service';
import { AccessTokenDataType, TokensType } from '../auth/application/types/types';
import { SessionDto } from '../security/application/dto/SessionDto';

@Injectable()
export class ApiJwtService {
  constructor(private jwtService: JwtService, private apiConfigService: ApiConfigService) {}

  async createJWT(userId: string, deviceId: string): Promise<TokensType> {
    const secretRT = this.apiConfigService.JWT_SECRET_FOR_REFRESHTOKEN;
    const expiresInRT = this.apiConfigService.EXPIRES_IN_TIME_OF_REFRESHTOKEN;

    const accessToken = this.jwtService.sign({ userId });
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
}

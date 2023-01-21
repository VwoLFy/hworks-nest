import { settings } from '../../main/settings';
import { SecurityService } from '../../security/application/security-service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AccessTokenDataType = { userId: string };
export type RefreshTokenDataType = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};
type TokensType = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AppJwtService {
  constructor(protected securityService: SecurityService, private jwtService: JwtService) {}

  async createJWT(userId: string, deviceId: string | null): Promise<TokensType> {
    const accessToken = this.jwtService.sign({ userId }, { secret: settings.JWT_SECRET, expiresIn: '10m' });
    deviceId = deviceId ? deviceId : await this.securityService.newDeviceId();
    const refreshToken = this.jwtService.sign(
      { userId, deviceId },
      { secret: settings.JWT_SECRET_FOR_REFRESHTOKEN, expiresIn: '1d' },
    );
    return { accessToken, refreshToken };
  }

  async updateTokens(usedRefreshTokenData: RefreshTokenDataType, ip: string, title: string): Promise<TokensType> {
    const tokens = await this.createJWT(usedRefreshTokenData.userId, usedRefreshTokenData.deviceId);
    const newRefreshTokenData = await this.getRefreshTokenData(tokens.refreshToken);

    await this.securityService.updateSessionData({ ...newRefreshTokenData, ip, title });
    return tokens;
  }

  async deleteRefreshToken(refreshTokenData: RefreshTokenDataType) {
    await this.securityService.deleteSessionByDeviceId(refreshTokenData.userId, refreshTokenData.deviceId);
  }

  async checkAndGetRefreshTokenData(refreshToken: string): Promise<RefreshTokenDataType | null> {
    try {
      const refreshTokenData = this.jwtService.verify(refreshToken, {
        secret: settings.JWT_SECRET_FOR_REFRESHTOKEN,
      }) as RefreshTokenDataType;
      const isActiveRefreshToken = await this.securityService.isValidSession({ ...refreshTokenData });
      return isActiveRefreshToken ? refreshTokenData : null;
    } catch (e) {
      return null;
    }
  }

  async getRefreshTokenData(refreshToken: string): Promise<RefreshTokenDataType> {
    return this.jwtService.decode(refreshToken) as RefreshTokenDataType;
  }

  async getUserIdByAccessToken(accessToken: string): Promise<string | null> {
    try {
      const result = this.jwtService.verify(accessToken, { secret: settings.JWT_SECRET }) as AccessTokenDataType;
      return result.userId;
    } catch (e) {
      return null;
    }
  }
}

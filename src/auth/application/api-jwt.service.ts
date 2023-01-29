import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiConfigService } from '../../main/configuration/api.config.service';
import { TokensType } from './types/types';
import { SessionDto } from '../../security/application/dto/SessionDto';
import { SecurityRepository } from '../../security/infrastructure/security.repository';

@Injectable()
export class ApiJwtService {
  constructor(
    protected securityRepository: SecurityRepository,
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
  ) {}

  async createJWT(userId: string, deviceId: string | null): Promise<TokensType> {
    const secretRT = this.apiConfigService.JWT_SECRET_FOR_REFRESHTOKEN;
    const expiresInRT = this.apiConfigService.EXPIRES_IN_TIME_OF_REFRESHTOKEN;

    const accessToken = this.jwtService.sign({ userId });

    deviceId = deviceId ? deviceId : await this.newDeviceId();
    const refreshToken = this.jwtService.sign({ userId, deviceId }, { secret: secretRT, expiresIn: expiresInRT });

    return { accessToken, refreshToken };
  }

  async getSessionDataByRefreshToken(refreshToken: string): Promise<SessionDto | null> {
    try {
      const secretRT = this.apiConfigService.JWT_SECRET_FOR_REFRESHTOKEN;
      return this.jwtService.verify(refreshToken, { secret: secretRT }) as SessionDto;
    } catch (e) {
      return null;
    }
  }

  private async newDeviceId(): Promise<string> {
    return String((await this.securityRepository.maxValueActiveDeviceId()) + 1);
  }
}

import { ApiJwtService } from '../../../auth/application/api-jwt.service';
import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { TokensType } from '../../../auth/application/types/types';
import { SessionDto } from '../dto/SessionDto';

@Injectable()
export class UpdateSessionUseCase {
  constructor(protected apiJwtService: ApiJwtService, protected securityRepository: SecurityRepository) {}

  async execute(oldSessionData: SessionDto, ip: string, title: string): Promise<TokensType> {
    const tokens = await this.apiJwtService.createJWT(oldSessionData.userId, oldSessionData.deviceId);
    const newSessionData = await this.apiJwtService.getSessionDataByRefreshToken(tokens.refreshToken);

    const foundSession = await this.securityRepository.findSessionByDeviceId(newSessionData.deviceId);
    if (!foundSession) return;

    foundSession.updateSessionData({ ...newSessionData, ip, title });
    await this.securityRepository.saveSession(foundSession);

    return tokens;
  }
}

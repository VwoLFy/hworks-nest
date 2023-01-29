import { Injectable } from '@nestjs/common';
import { SessionDto } from '../dto/SessionDto';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { ApiJwtService } from '../../../auth/application/api-jwt.service';

@Injectable()
export class GetDataIfSessionIsActiveUseCase {
  constructor(protected securityRepository: SecurityRepository, private apiJwtService: ApiJwtService) {}

  async execute(refreshToken: string): Promise<SessionDto | null> {
    const sessionData = await this.apiJwtService.getSessionDataByRefreshToken(refreshToken);
    if (!sessionData) return null;

    const isActiveSession = await this.isActiveSession(sessionData);
    return isActiveSession ? sessionData : null;
  }

  private async isActiveSession(dto: SessionDto): Promise<boolean> {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    return !(!foundSession || dto.iat !== foundSession.iat || dto.userId !== foundSession.userId);
  }
}

import { Injectable } from '@nestjs/common';
import { SessionExtendedDto } from './dto/SessionExtendedDto';
import { Session } from '../domain/session.entity';
import { SecurityRepository } from '../infrastructure/security.repository';
import { SessionDto } from './dto/SessionDto';

@Injectable()
export class SecurityService {
  constructor(protected securityRepository: SecurityRepository) {}

  async createSession(dto: SessionExtendedDto) {
    const session = new Session(dto);
    await this.securityRepository.saveSession(session);
  }

  async updateSession(dto: SessionExtendedDto) {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    if (!foundSession) return;

    foundSession.updateSessionData(dto);
    await this.securityRepository.updateSession(foundSession);
  }

  async isActiveSession(dto: SessionDto): Promise<boolean> {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    return !(!foundSession || dto.iat !== foundSession.iat || dto.userId !== foundSession.userId);
  }

  async newDeviceId(): Promise<string> {
    return String((await this.securityRepository.maxValueActiveDeviceId()) + 1);
  }

  async deleteAllUserSessions(userId: string) {
    await this.securityRepository.deleteAllUserSessions(userId);
  }
}

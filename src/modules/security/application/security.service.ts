import { Injectable } from '@nestjs/common';
import { SessionExtendedDto } from './dto/SessionExtendedDto';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from '../domain/session.schema';
import { Model } from 'mongoose';
import { SecurityRepository } from '../infrastructure/security.repository';
import { SessionDto } from './dto/SessionDto';

@Injectable()
export class SecurityService {
  constructor(
    protected securityRepository: SecurityRepository,
    @InjectModel(Session.name) private SessionModel: Model<SessionDocument>,
  ) {}

  async createSession(dto: SessionExtendedDto) {
    const session = new Session(dto);
    const sessionModel = new this.SessionModel(session);
    await this.securityRepository.saveSession(sessionModel);
  }

  async updateSession(dto: SessionExtendedDto) {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    if (!foundSession) return;

    foundSession.updateSessionData(dto);
    await this.securityRepository.saveSession(foundSession);
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

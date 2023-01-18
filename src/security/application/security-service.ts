import { SecurityRepository } from '../infrastructure/security-repository';
import { SessionDto } from './dto/SessionDto';
import { Session, SessionDocument } from '../domain/session.schema';
import { ShortSessionDto } from './dto/ShortSessionDto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SecurityService {
  constructor(
    protected securityRepository: SecurityRepository,
    @InjectModel(Session.name) private SessionModel: Model<SessionDocument>,
  ) {}

  async saveSession(dto: SessionDto): Promise<void> {
    const session = new this.SessionModel(dto);
    await this.securityRepository.saveSession(session);
  }

  async updateSessionData(dto: SessionDto) {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    if (!foundSession) return;

    foundSession.updateSessionData(dto);
    await this.securityRepository.saveSession(foundSession);
  }

  async isValidSession(dto: ShortSessionDto): Promise<boolean> {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    return !(!foundSession || dto.iat !== foundSession.iat || dto.userId !== foundSession.userId);
  }

  async newDeviceId(): Promise<string> {
    return String((await this.securityRepository.maxValueActiveDeviceId()) + 1);
  }

  async deleteSessionsOfUser(userId: string, deviceId: string): Promise<boolean> {
    return await this.securityRepository.deleteSessionsOfUser(userId, deviceId);
  }

  async deleteSessionByDeviceId(userId: string, deviceId: string): Promise<number> {
    const foundSession = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!foundSession) return 404;
    if (foundSession.userId !== userId) return 403;

    return await this.securityRepository.deleteSessionByDeviceId(deviceId);
  }

  async deleteAll() {
    await this.securityRepository.deleteAll();
  }
}

import { Session } from '../domain/session.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';

@Injectable()
export class SecurityRepository {
  constructor(@InjectRepository(Session) private readonly sessionRepositoryT: Repository<Session>) {}

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepositoryT.findOne({ where: { deviceId: deviceId } });
    return session ?? null;
  }

  async saveSession(session: Session): Promise<void> {
    await this.sessionRepositoryT.save(session);
  }

  async maxValueActiveDeviceId(): Promise<number> {
    const foundSession = (
      await this.sessionRepositoryT.find({
        order: { deviceId: 'desc' },
      })
    )[0];
    return foundSession ? +foundSession.deviceId : 0;
  }

  async deleteSessionsExceptCurrent(userId: string, deviceId: string) {
    await this.sessionRepositoryT.delete({ userId: userId, deviceId: Not(deviceId) });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    await this.sessionRepositoryT.delete({ deviceId: deviceId });
  }

  async deleteAll() {
    await this.sessionRepositoryT.clear();
  }

  async deleteAllUserSessionsTransaction(userId: string, manager: EntityManager) {
    await manager.delete(Session, { userId: userId });
  }
}

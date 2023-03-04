import { DeviceViewModel } from '../api/models/DeviceViewModel';
import { Injectable } from '@nestjs/common';
import { Session } from '../domain/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SecurityQueryRepo {
  constructor(@InjectRepository(Session) private readonly sessionRepositoryT: Repository<Session>) {}

  async findUserSessions(userId: string): Promise<DeviceViewModel[]> {
    const foundSessions = await this.sessionRepositoryT.find({
      where: { userId: userId },
    });
    return foundSessions.map((s) => new DeviceViewModel(s));
  }
}

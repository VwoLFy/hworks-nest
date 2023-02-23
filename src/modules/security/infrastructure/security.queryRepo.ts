import { DeviceViewModel } from '../api/models/DeviceViewModel';
import { Injectable } from '@nestjs/common';
import { Session } from '../domain/session.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SecurityQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserSessions(userId: string): Promise<DeviceViewModel[]> {
    const foundSessions: Session[] = (
      await this.dataSource.query(`SELECT * FROM public."Sessions" WHERE "userId" = $1`, [userId])
    ).map((u) => Session.createSessionFromDB(u));
    return foundSessions.map((s) => new DeviceViewModel(s));
  }
}

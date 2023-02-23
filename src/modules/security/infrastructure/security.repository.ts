import { Session } from '../domain/session.schema';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionFromDB } from './dto/SessionFromDB';

@Injectable()
export class SecurityRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    const sessionFromDB: SessionFromDB = (
      await this.dataSource.query(
        `SELECT *
            FROM public."Sessions" 
            WHERE "deviceId" = $1`,
        [deviceId],
      )
    )[0];

    if (!sessionFromDB) return null;
    return Session.createSessionFromDB(sessionFromDB);
  }

  async saveSession(session: Session): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO public."Sessions"("id", "userId", "exp", "ip", "title", "iat", "deviceId")	VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [session.id, session.userId, session.exp, session.ip, session.title, session.iat, session.deviceId],
    );
  }

  async maxValueActiveDeviceId(): Promise<number> {
    const sessionFromDB: SessionFromDB = (
      await this.dataSource.query(`SELECT * FROM public."Sessions" ORDER BY "deviceId" desc`)
    )[0];
    return sessionFromDB ? +sessionFromDB.deviceId : 0;
  }

  async deleteSessionsExceptCurrent(userId: string, deviceId: string) {
    await this.dataSource.query(
      `DELETE FROM public."Sessions" WHERE "userId" = '${userId}' AND "deviceId" != '${deviceId}';`,
    );
  }

  async deleteSessionByDeviceId(deviceId: string) {
    await this.dataSource.query(`DELETE FROM public."Sessions" WHERE "deviceId" = '${deviceId}';`);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."Sessions";`);
  }

  async deleteAllUserSessions(userId: string) {
    await this.dataSource.query(`DELETE FROM public."Sessions" WHERE "userId" = '${userId}';`);
  }

  async updateSession(session: Session) {
    await this.dataSource.query(
      `UPDATE public."Sessions" 
            SET "exp"=$1, "ip"=$2, "title"=$3, "iat"=$4
            WHERE "deviceId" = $5`,
      [session.exp, session.ip, session.title, session.iat, session.deviceId],
    );
  }
}

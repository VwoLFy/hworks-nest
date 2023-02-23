import { SessionExtendedDto } from '../application/dto/SessionExtendedDto';
import { randomUUID } from 'crypto';
import { SessionFromDB } from '../infrastructure/dto/SessionFromDB';

export class Session {
  id: string;
  userId: string;
  exp: number;
  ip: string;
  title: string;
  iat: number;
  deviceId: string;

  constructor(dto: SessionExtendedDto) {
    this.id = randomUUID();
    this.userId = dto.userId;
    this.exp = dto.exp;
    this.ip = dto.ip;
    this.title = dto.title;
    this.iat = dto.iat;
    this.deviceId = dto.deviceId;
  }

  updateSessionData(dto: SessionExtendedDto) {
    this.ip = dto.ip;
    this.title = dto.title;
    this.exp = dto.exp;
    this.iat = dto.iat;
  }

  static createSessionFromDB(sessionFromDB: SessionFromDB): Session {
    return new Session(sessionFromDB);
  }
}

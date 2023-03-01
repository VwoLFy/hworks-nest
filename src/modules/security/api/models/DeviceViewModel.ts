import { Session } from '../../domain/session.entity';

export class DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: number;

  constructor(session: Session) {
    this.ip = session.ip;
    this.title = session.title;
    this.lastActiveDate = new Date(session.iat * 1000).toISOString();
    this.deviceId = session.deviceId;
  }
}

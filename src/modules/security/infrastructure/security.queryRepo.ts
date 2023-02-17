import { Session, SessionDocument } from '../domain/session.schema';
import { DeviceViewModel } from '../api/models/DeviceViewModel';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SecurityQueryRepo {
  constructor(@InjectModel(Session.name) private SessionModel: Model<SessionDocument>) {}

  async findUserSessions(userId: string): Promise<DeviceViewModel[]> {
    return (await this.SessionModel.find({ userId }).lean()).map((s) => new DeviceViewModel(s));
  }
}

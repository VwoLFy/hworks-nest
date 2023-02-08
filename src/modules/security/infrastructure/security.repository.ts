import { Session, SessionDocument } from '../domain/session.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(@InjectModel(Session.name) private SessionModel: Model<SessionDocument>) {}

  async findSessionByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async saveSession(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async maxValueActiveDeviceId(): Promise<number> {
    return (await this.SessionModel.find().sort({ deviceId: -1 }).limit(1).lean()).reduce(
      (acc, it) => (acc > +it.deviceId ? acc : +it.deviceId),
      0,
    );
  }

  async DeleteSessionsExceptCurrent(userId: string, deviceId: string) {
    const deleteFilter = { userId, deviceId: { $ne: deviceId } };
    await this.SessionModel.deleteMany(deleteFilter);
  }

  async deleteSessionByDeviceId(deviceId: string) {
    await this.SessionModel.deleteOne({ deviceId });
  }

  async deleteAll() {
    await this.SessionModel.deleteMany();
  }

  async deleteAllUserSessions(userId: string) {
    await this.SessionModel.deleteMany({ userId });
  }
}

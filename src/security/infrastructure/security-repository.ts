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
  async deleteSessionsOfUser(userId: string, deviceId: string): Promise<boolean> {
    const deleteFilter = { userId, deviceId: { $ne: deviceId } };
    const result = await this.SessionModel.deleteMany(deleteFilter);
    return !!result.deletedCount;
  }
  async deleteSessionByDeviceId(deviceId: string): Promise<number> {
    const result = await this.SessionModel.deleteOne({ deviceId });
    return result.deletedCount ? 204 : 404;
  }
  async deleteAll() {
    await this.SessionModel.deleteMany({});
  }
}

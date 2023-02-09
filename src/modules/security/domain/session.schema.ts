import mongoose, { HydratedDocument } from 'mongoose';
import { SessionExtendedDto } from '../application/dto/SessionExtendedDto';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Session {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  exp: number;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  iat: number;

  @Prop({ required: true })
  deviceId: string;

  constructor(dto: SessionExtendedDto) {
    this._id = new ObjectId();
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
}

export type SessionDocument = HydratedDocument<Session>;

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

import { HydratedDocument } from 'mongoose';
import { SessionDto } from '../application/dto/SessionDto';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Session {
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

  updateSessionData(dto: SessionDto) {
    this.ip = dto.ip;
    this.title = dto.title;
    this.exp = dto.exp;
    this.iat = dto.iat;
  }
}

export type SessionDocument = HydratedDocument<Session>;

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

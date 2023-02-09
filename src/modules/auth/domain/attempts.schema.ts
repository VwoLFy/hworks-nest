import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';

@Schema()
export class AttemptsData {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  url: string;

  constructor(dto: AttemptsDataDto) {
    this.date = new Date();
    this.ip = dto.ip;
    this.url = dto.url;
  }
}
export type AttemptsDataDocument = HydratedDocument<AttemptsData>;

export const AttemptsDataSchema = SchemaFactory.createForClass(AttemptsData);

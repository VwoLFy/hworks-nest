import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AttemptsData {
  @Prop({ default: Date.now })
  date: Date;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  url: string;
}
export type AttemptsDataDocument = HydratedDocument<AttemptsData>;

export const AttemptsDataSchema = SchemaFactory.createForClass(AttemptsData);

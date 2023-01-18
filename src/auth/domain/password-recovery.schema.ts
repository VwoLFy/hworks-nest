import { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({ default: randomUUID() })
  recoveryCode: string;

  @Prop({ default: add(new Date(), { hours: 24 }) })
  expirationDate: Date;

  @Prop({
    required: true,
    validate: (val: string) => {
      return val.match('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    },
  })
  email: string;
}
export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

export const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);

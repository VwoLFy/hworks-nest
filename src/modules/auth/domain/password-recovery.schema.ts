import { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema()
export class PasswordRecovery {
  @Prop({ required: true })
  recoveryCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({
    required: true,
    validate: (val: string) => {
      return val.match('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    },
  })
  email: string;

  constructor(email: string) {
    this.email = email;
    this.recoveryCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 24 });
  }
}
export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;

export const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);

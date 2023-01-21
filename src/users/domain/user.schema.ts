import { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

export class AccountData {
  createdAt: Date;

  constructor(public login: string, public passwordHash: string, public email: string) {
    this.createdAt = new Date();
  }
}
export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: Date;

  constructor(public isConfirmed: boolean) {
    this.confirmationCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 1 });
  }
}

@Schema()
export class User {
  _id: ObjectId;

  @Prop({ required: true, type: AccountData })
  accountData: AccountData;

  @Prop({ required: true, type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;

  confirmUser() {
    this.emailConfirmation.isConfirmed = true;
  }
  updateEmailConfirmation() {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }
  updatePassword(passwordHash: string) {
    this.accountData.passwordHash = passwordHash;
  }
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

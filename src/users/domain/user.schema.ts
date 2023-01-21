import { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ _id: false })
export class AccountData {
  @Prop({ required: true })
  createdAt: Date;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 30,
    validate: (val: string) => {
      return val.match('^[a-zA-Z0-9_-]*$');
    },
  })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    validate: (val: string) => {
      return val.match('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    },
  })
  email: string;

  constructor(login: string, passwordHash: string, email: string) {
    this.createdAt = new Date();
    this.login = login;
    this.passwordHash = passwordHash;
    this.email = email;
  }
}
export const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;

  constructor(isConfirmed: boolean) {
    this.confirmationCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 1 });
    this.isConfirmed = isConfirmed;
  }
}
export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User {
  _id: ObjectId;

  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;

  @Prop({ required: true, type: EmailConfirmationSchema })
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

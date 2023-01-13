import { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema({ _id: false })
export class AccountData {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ default: randomUUID() })
  confirmationCode: string;

  @Prop({ default: add(new Date(), { hours: 1 }) })
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}

export const UserAccountSchema = SchemaFactory.createForClass(AccountData);
export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User {
  _id: ObjectId;

  @Prop({ required: true, type: UserAccountSchema })
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

export type AccountDataDocument = HydratedDocument<AccountData>;
export type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>;
export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

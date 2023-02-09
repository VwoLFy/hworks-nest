import mongoose, { HydratedDocument } from 'mongoose';
import { add } from 'date-fns';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { BanUserDto } from '../application/dto/BanUserDto';

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

@Schema({ _id: false })
export class BanInfo {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop()
  banDate: Date | null;

  @Prop()
  banReason: string | null;

  constructor() {
    this.isBanned = false;
    this.banDate = null;
    this.banReason = null;
  }
}
export const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

@Schema()
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  _id: ObjectId;

  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;

  @Prop({ required: true, type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;

  constructor(login: string, passwordHash: string, email: string, isConfirmed: boolean) {
    this._id = new ObjectId();
    this.accountData = new AccountData(login, passwordHash, email);
    this.emailConfirmation = new EmailConfirmation(isConfirmed);
    this.banInfo = new BanInfo();
  }

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

  banUser(dto: BanUserDto) {
    this.banInfo.isBanned = dto.isBanned;

    if (dto.isBanned) {
      this.banInfo.banReason = dto.banReason;
      this.banInfo.banDate = new Date();
    } else {
      this.banInfo.banReason = null;
      this.banInfo.banDate = null;
    }
  }
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

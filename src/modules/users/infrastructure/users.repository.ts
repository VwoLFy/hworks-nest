import { User, UserDocument } from '../domain/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const foundUser = await this.UserModel.findOne({
      $or: [
        { 'accountData.login': { $regex: loginOrEmail, $options: 'i' } },
        { 'accountData.email': { $regex: loginOrEmail, $options: 'i' } },
      ],
    });
    return foundUser ? foundUser : null;
  }

  async findUserLoginByIdOrThrowError(userId: string): Promise<string> {
    const result = await this.UserModel.findOne({ _id: userId });
    if (!result) throw new NotFoundException('user not found');
    return result.accountData.login;
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id: userId });
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': confirmationCode,
    });
  }

  async saveUser(user: UserDocument): Promise<void> {
    await user.save();
  }

  async deleteUser(userId: string) {
    await this.UserModel.deleteOne({ _id: userId });
  }

  async deleteAll() {
    await this.UserModel.deleteMany();
  }
}

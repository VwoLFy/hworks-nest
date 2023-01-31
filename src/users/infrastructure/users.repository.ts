import { ObjectId } from 'mongodb';
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

  async findUserLoginById(id: string): Promise<string | null> {
    const result = await this.UserModel.findOne({ _id: id });
    if (!result) return null;
    return result.accountData.login;
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': confirmationCode,
    });
  }

  async isFreeLoginAndEmail(login: string, email: string): Promise<boolean> {
    return !(await this.UserModel.findOne({
      $or: [
        { 'accountData.login': { $regex: login, $options: 'i' } },
        { 'accountData.email': { $regex: email, $options: 'i' } },
      ],
    }));
  }

  async saveUser(user: UserDocument): Promise<void> {
    await user.save();
  }

  async deleteUser(_id: ObjectId) {
    const result = await this.UserModel.deleteOne({ _id });
    if (!result) throw new NotFoundException('user not found');
  }

  async deleteAll() {
    await this.UserModel.deleteMany();
  }
}

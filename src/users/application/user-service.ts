import { UsersRepository } from '../infrastructure/users-repository';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { CreateUserDto } from './dto/CreateUserDto';
import {
  EmailConfirmation,
  User,
  AccountData,
  UserDocument,
} from '../domain/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(AccountData.name)
    private UserAccountModel: Model<UserDocument>,
    @InjectModel(EmailConfirmation.name)
    private EmailConfirmationModel: Model<UserDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string | null> {
    const { login, password, email } = dto;

    const isFreeLoginAndEmail = await this.usersRepository.isFreeLoginAndEmail(
      login,
      email,
    );
    if (!isFreeLoginAndEmail) return null;

    const passwordHash = await this.getPasswordHash(password);

    const userAccount = new this.UserAccountModel({
      login,
      passwordHash,
      email,
    });
    const emailConfirmation = new this.EmailConfirmationModel({
      isConfirmed: true,
    });
    const user = new this.UserModel({
      accountData: userAccount,
      emailConfirmation,
    });
    await this.usersRepository.saveUser(user);
    return user.id;
  }
  async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }
  async deleteUser(_id: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(new ObjectId(_id));
  }
  async deleteAll() {
    await this.usersRepository.deleteAll();
  }
}

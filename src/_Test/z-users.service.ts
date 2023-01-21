import { ZUsersRepository } from './z-users-repository.service';
import { Injectable } from '@nestjs/common';
import { StaticsZUserType, ZUser, ZUserDocument } from './ZUserSchema';
import { InputModelType } from './ZUsersController';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ZUsersService {
  constructor(
    protected zUsersRepository: ZUsersRepository,
    @InjectModel(ZUser.name)
    private UserModel: Model<ZUserDocument> & StaticsZUserType,
  ) {}

  async findUsers(term): Promise<ZUser[] | null> {
    return this.zUsersRepository.findUsers(term);
  }

  async createUser(input: InputModelType): Promise<ZUser> {
    const user = new this.UserModel(input);
    const hz = this.UserModel.createHZ(this.UserModel, input);
    console.log(hz);
    await user.save();
    await hz.createHZ2(input);
    return user;
    //return this.usersRepository.userSave(user);
  }

  async updateUser(userID: string, name: string) {
    const user = await this.zUsersRepository.findUser(userID);
    user.setName(name);
    await this.zUsersRepository.userSave(user);
  }
}

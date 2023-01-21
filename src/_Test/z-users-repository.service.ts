import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StaticsZUserType, ZUser, ZUserDocument } from './ZUserSchema';
import { Model } from 'mongoose';

@Injectable()
export class ZUsersRepository {
  constructor(
    @InjectModel(ZUser.name)
    private ZUserModel: Model<ZUserDocument, StaticsZUserType>,
  ) {}

  async findUsers(term): Promise<ZUserDocument[] | null> {
    let filter = {};
    if (term) filter = { name: { $regex: term } };

    return this.ZUserModel.find(filter);
  }

  async userSave(user: ZUserDocument): Promise<ZUserDocument> {
    await user.save();
    return user;
  }

  async findUser(userID: string): Promise<ZUserDocument> {
    return this.ZUserModel.findOne({ _id: userID });
  }
}

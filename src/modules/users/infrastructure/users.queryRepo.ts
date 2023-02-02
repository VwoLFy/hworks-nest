import { User, UserDocument } from '../domain/user.schema';
import { UserViewModel } from '../api/models/UserViewModel';
import { UserViewModelPage } from '../api/models/UserViewModelPage';
import { FindUsersQueryModel } from '../api/models/FindUsersQueryModel';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanStatuses } from '../../../main/types/enums';

@Injectable()
export class UsersQueryRepo {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findUsers(dto: FindUsersQueryModel): Promise<UserViewModelPage> {
    const { banStatus, searchLoginTerm, searchEmailTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;
    let filterFind = {};

    if (searchLoginTerm && searchEmailTerm) {
      filterFind = {
        $or: [
          { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
          { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
        ],
      };
    } else if (searchLoginTerm) {
      filterFind = {
        'accountData.login': { $regex: searchLoginTerm, $options: 'i' },
      };
    } else if (searchEmailTerm) {
      filterFind = {
        'accountData.email': { $regex: searchEmailTerm, $options: 'i' },
      };
    }

    if (banStatus === BanStatuses.banned) filterFind = { $and: [{ 'banInfo.isBanned': true }, filterFind] };
    if (banStatus === BanStatuses.notBanned) filterFind = { $and: [{ 'banInfo.isBanned': false }, filterFind] };

    const optionsSort = { [`accountData.${sortBy}`]: sortDirection };

    const totalCount = await this.UserModel.countDocuments(filterFind);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    const items = (
      await this.UserModel.find(filterFind)
        .sort(optionsSort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()
    ).map((foundBlog) => this.userWithReplaceId(foundBlog));

    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items,
    };
  }

  async findUserById(_id: string): Promise<UserViewModel> {
    const foundUser = await this.UserModel.findById({ _id }).lean();
    if (!foundUser) throw new NotFoundException('User not found');

    return this.userWithReplaceId(foundUser);
  }

  userWithReplaceId(object: User): UserViewModel {
    return {
      id: object._id.toString(),
      login: object.accountData.login,
      email: object.accountData.email,
      createdAt: object.accountData.createdAt.toISOString(),
      banInfo: {
        ...object.banInfo,
        banDate: object.banInfo.banDate === null ? null : object.banInfo.banDate.toISOString(),
      },
    };
  }
}

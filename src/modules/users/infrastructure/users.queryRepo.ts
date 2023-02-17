import { User, UserDocument } from '../domain/user.schema';
import { UserViewModel } from '../api/models/UserViewModel';
import { FindUsersQueryModel } from '../api/models/FindUsersQueryModel';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BanStatuses } from '../../../main/types/enums';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindBannedUsersForBlogQueryModel } from '../api/models/FindBannedUsersForBlogQueryModel';
import { BannedUserForBlogViewModel } from '../api/models/BannedUserForBlogViewModel';
import { BannedUserForBlog, BannedUserForBlogDocument } from '../domain/banned-user-for-blog.schema';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(BannedUserForBlog.name) private BannedUserForBlogModel: Model<BannedUserForBlogDocument>,
  ) {}

  async findUsers(dto: FindUsersQueryModel): Promise<PageViewModel<UserViewModel>> {
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

    const items = (
      await this.UserModel.find(filterFind)
        .sort(optionsSort)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()
    ).map((u) => new UserViewModel(u));

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }

  async findUserById(_id: string): Promise<UserViewModel> {
    const foundUser = await this.UserModel.findById({ _id }).lean();
    if (!foundUser) throw new NotFoundException('User not found');

    return new UserViewModel(foundUser);
  }

  async findBannedUsersForBlog(
    blogId: string,
    dto: FindBannedUsersForBlogQueryModel,
  ): Promise<PageViewModel<BannedUserForBlogViewModel>> {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    let filterFind = {};
    if (searchLoginTerm) {
      filterFind = {
        login: { $regex: searchLoginTerm, $options: 'i' },
      };
    }

    const totalCount = await this.BannedUserForBlogModel.countDocuments(filterFind).where('blogId', blogId);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const items = (
      await this.BannedUserForBlogModel.find(filterFind)
        .where('blogId', blogId)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
    ).map((u) => new BannedUserForBlogViewModel(u));

    return new PageViewModel(
      {
        pagesCount,
        pageNumber,
        pageSize,
        totalCount,
      },
      items,
    );
  }
}

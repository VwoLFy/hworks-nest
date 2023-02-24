import { User } from '../domain/user.schema';
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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserFromDB } from './types/UserFromDB';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectModel(BannedUserForBlog.name) private BannedUserForBlogModel: Model<BannedUserForBlogDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findUsers(dto: FindUsersQueryModel): Promise<PageViewModel<UserViewModel>> {
    const { banStatus, searchLoginTerm, searchEmailTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;
    let filterFind = 'true';
    let filterFindPar = [];

    if (searchLoginTerm && searchEmailTerm) {
      filterFind = `(LOWER(ac."login") like LOWER($1) OR LOWER(ac."email") like LOWER($2))`;
      filterFindPar = [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`];
    } else if (searchLoginTerm) {
      filterFind = `(LOWER(ac."login") like LOWER($1))`;
      filterFindPar = [`%${searchLoginTerm}%`];
    } else if (searchEmailTerm) {
      filterFind = `(LOWER(ac."email") like LOWER($1))`;
      filterFindPar = [`%${searchEmailTerm}%`];
    }

    if (banStatus === BanStatuses.banned) filterFind = `b."isBanned" = true AND ${filterFind}`;
    if (banStatus === BanStatuses.notBanned) filterFind = `b."isBanned" = false AND ${filterFind}`;

    const { count } = (
      await this.dataSource.query(
        `SELECT COUNT(*)
	          FROM public."Users" u
	          LEFT JOIN public."AccountData" ac 
	          ON ac."ownerId" = u.id
		        LEFT JOIN public."EmailConfirmation" e
	          ON e."ownerId" = u.id
			      LEFT JOIN public."BanInfo" b
	          ON b."ownerId" = u.id
	          WHERE ${filterFind}`,
        filterFindPar,
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundUsers: User[] = (
      await this.dataSource.query(
        `SELECT id, ac.*, e.*, b.*
	          FROM public."Users" u
	          LEFT JOIN public."AccountData" ac 
	          ON ac."ownerId" = u.id
		        LEFT JOIN public."EmailConfirmation" e
	          ON e."ownerId" = u.id
			      LEFT JOIN public."BanInfo" b
	          ON b."ownerId" = u.id
	          WHERE ${filterFind}
	          ORDER BY ac."${sortBy}" ${sortDirection}
	          LIMIT ${pageSize} OFFSET ${offset};`,
        filterFindPar,
      )
    ).map((u) => User.createUserFromDB(u));

    const items = foundUsers.map((u) => new UserViewModel(u));
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

  async findUserById(id: string): Promise<UserViewModel> {
    const query = `SELECT id, ac.*, e.*, b.*
            FROM public."Users" u
            LEFT JOIN public."AccountData" ac 
            ON ac."ownerId" = u.id
            LEFT JOIN public."EmailConfirmation" e
            ON e."ownerId" = u.id
            LEFT JOIN public."BanInfo" b
            ON b."ownerId" = u.id
            WHERE id = $1`;
    const userFromDB: UserFromDB = (await this.dataSource.query(query, [id]))[0];
    if (!userFromDB) throw new NotFoundException('User not found');

    const foundUser = User.createUserFromDB(userFromDB);
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

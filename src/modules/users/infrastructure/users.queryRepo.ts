import { User } from '../domain/user.entity';
import { UserViewModel } from '../api/models/UserViewModel';
import { FindUsersQueryModel } from '../api/models/FindUsersQueryModel';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BanStatuses } from '../../../main/types/enums';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindBannedUsersForBlogQueryModel } from '../api/models/FindBannedUsersForBlogQueryModel';
import { BannedUserForBlogViewModel } from '../api/models/BannedUserForBlogViewModel';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserFromDB } from './types/UserFromDB';
import { BannedUserForBlogFromDB } from './types/BannedUserForBlogFromDB';

@Injectable()
export class UsersQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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
    let filterFind = `true`;
    let filterFindPar = [];

    if (searchLoginTerm) {
      filterFind = `(LOWER("userLogin") like LOWER($2))`;
      filterFindPar = [`%${searchLoginTerm}%`];
    }

    const { count } = (
      await this.dataSource.query(
        `SELECT COUNT(*)
	          FROM public."BannedUsersForBlogs" 
	          WHERE "blogId" = $1 AND ${filterFind}`,
        [blogId, ...filterFindPar],
      )
    )[0];

    const totalCount = +count;
    const pagesCount = Math.ceil(totalCount / pageSize);
    const offset = (pageNumber - 1) * pageSize;

    const foundUsers: BannedUserForBlogFromDB[] = await this.dataSource.query(
      `SELECT * FROM public."BannedUsersForBlogs" 
	          WHERE "blogId" = $1 AND ${filterFind}
	          ORDER BY "${sortBy}" ${sortDirection}
            LIMIT ${pageSize} OFFSET ${offset};`,
      [blogId, ...filterFindPar],
    );

    const items = foundUsers.map((u) => new BannedUserForBlogViewModel(u));
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

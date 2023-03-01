import { User } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BannedUserForBlog } from '../domain/banned-user-for-blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserFromDB } from './types/UserFromDB';
import { BannedUserForBlogFromDB } from './types/BannedUserForBlogFromDB';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const userFromDB: UserFromDB = (
      await this.dataSource.query(
        `SELECT id, ac.*, e.*, b.*
            FROM public."Users" u
            LEFT JOIN public."UsersAccountData" ac 
            ON ac."userId" = u.id
            LEFT JOIN public."UsersEmailConfirmation" e
            ON e."userId" = u.id
            LEFT JOIN public."UsersBanInfo" b
            ON b."userId" = u.id
            WHERE LOWER(ac."login") = LOWER($1) OR LOWER(ac."email") = LOWER($1) `,
        [loginOrEmail],
      )
    )[0];

    if (!userFromDB) return null;
    return User.createUserFromDB(userFromDB);
  }

  async findUserLoginByIdOrThrowError(userId: string): Promise<string> {
    const userFromDB: UserFromDB = (
      await this.dataSource.query(
        `SELECT id, ac.*, e.*, b.*
            FROM public."Users" u
            LEFT JOIN public."UsersAccountData" ac 
            ON ac."userId" = u.id
            LEFT JOIN public."UsersEmailConfirmation" e
            ON e."userId" = u.id
            LEFT JOIN public."UsersBanInfo" b
            ON b."userId" = u.id
            WHERE id = $1`,
        [userId],
      )
    )[0];

    if (!userFromDB) throw new NotFoundException('user not found');
    return userFromDB.login;
  }

  async findUserById(userId: string): Promise<User | null> {
    const userFromDB: UserFromDB = (
      await this.dataSource.query(
        `SELECT id, ac.*, e.*, b.*
            FROM public."Users" u
            LEFT JOIN public."UsersAccountData" ac 
            ON ac."userId" = u.id
            LEFT JOIN public."UsersEmailConfirmation" e
            ON e."userId" = u.id
            LEFT JOIN public."UsersBanInfo" b
            ON b."userId" = u.id
            WHERE id = $1`,
        [userId],
      )
    )[0];

    if (!userFromDB) return null;
    return User.createUserFromDB(userFromDB);
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    const userFromDB: UserFromDB = (
      await this.dataSource.query(
        `SELECT id, ac.*, e.*, b.*
            FROM public."Users" u
            LEFT JOIN public."UsersAccountData" ac 
            ON ac."userId" = u.id
            LEFT JOIN public."UsersEmailConfirmation" e
            ON e."userId" = u.id
            LEFT JOIN public."UsersBanInfo" b
            ON b."userId" = u.id
            WHERE e."confirmationCode" = $1`,
        [confirmationCode],
      )
    )[0];

    if (!userFromDB) return null;
    return User.createUserFromDB(userFromDB);
  }

  async saveUser(user: User): Promise<void> {
    await this.dataSource.query(`INSERT INTO public."Users"("id")	VALUES ($1);`, [user.id]);
    await this.dataSource.query(
      `INSERT INTO public."UsersAccountData"("createdAt", "login", "passwordHash", "email", "userId")	VALUES ($1, $2, $3, $4, $5);`,
      [
        user.accountData.createdAt,
        user.accountData.login,
        user.accountData.passwordHash,
        user.accountData.email,
        user.id,
      ],
    );
    await this.dataSource.query(
      `INSERT INTO public."UsersEmailConfirmation"("isConfirmed", "confirmationCode", "codeExpirationDate",  "userId")	VALUES ($1, $2, $3, $4);`,
      [
        user.emailConfirmation.isConfirmed,
        user.emailConfirmation.confirmationCode,
        user.emailConfirmation.codeExpirationDate,
        user.id,
      ],
    );
    await this.dataSource.query(
      `INSERT INTO public."UsersBanInfo"("isBanned", "banDate", "banReason", "userId")	VALUES ($1, $2, $3, $4);`,
      [user.banInfo.isBanned, user.banInfo.banDate, user.banInfo.banReason, user.id],
    );
  }

  async deleteUser(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."UsersBanInfo" WHERE "userId" = '${userId}';
             DELETE FROM public."UsersAccountData" WHERE "userId" = '${userId}';
             DELETE FROM public."UsersEmailConfirmation" WHERE "userId" = '${userId}';
             DELETE FROM public."Users" WHERE "id" = '${userId}';`,
    );
  }

  async deleteAllUsers() {
    await this.dataSource.query(
      `DELETE FROM public."UsersBanInfo";
             DELETE FROM public."UsersAccountData";
             DELETE FROM public."UsersEmailConfirmation";
             DELETE FROM public."Users";`,
    );
  }

  async deleteAllBannedUsersForBlogs() {
    await this.dataSource.query(`DELETE FROM public."BannedUsersForBlogs"`);
  }

  async findBannedUserForBlog(blogId: string, userId: string): Promise<BannedUserForBlog | null> {
    const bannedUserForBlogFromDB: BannedUserForBlogFromDB = (
      await this.dataSource.query(`SELECT * FROM public."BannedUsersForBlogs" WHERE "userId" = $1 AND "blogId" = $2`, [
        userId,
        blogId,
      ])
    )[0];

    if (!bannedUserForBlogFromDB) return null;
    return BannedUserForBlog.createBannedUserForBlog(bannedUserForBlogFromDB);
  }

  async saveBannedUserForBlog(bannedUserForBlog: BannedUserForBlog) {
    await this.dataSource.query(
      `INSERT INTO public."BannedUsersForBlogs"("userId", "userLogin", "banReason", "banDate", "blogId")	VALUES ($1, $2, $3, $4, $5);`,
      [
        bannedUserForBlog.userId,
        bannedUserForBlog.userLogin,
        bannedUserForBlog.banReason,
        bannedUserForBlog.banDate,
        bannedUserForBlog.blogId,
      ],
    );
  }

  async deleteBannedUserForBlog(userId: string, blogId: string) {
    await this.dataSource.query(`DELETE FROM public."BannedUsersForBlogs" WHERE "userId" = $1 AND "blogId" = $2`, [
      userId,
      blogId,
    ]);
  }

  async updateBanInfo(user: User) {
    await this.dataSource.query(
      `UPDATE public."UsersBanInfo" 
            SET "isBanned"=$1, "banReason"=$2, "banDate"=$3
            WHERE "userId" = $4`,
      [user.banInfo.isBanned, user.banInfo.banReason, user.banInfo.banDate, user.id],
    );
  }

  async updatePasswordHash(user: User) {
    await this.dataSource.query(
      `UPDATE public."UsersAccountData" 
            SET "passwordHash"=$1
            WHERE "userId" = $2`,
      [user.accountData.passwordHash, user.id],
    );
  }

  async updateEmailConfirmation(user: User) {
    await this.dataSource.query(
      `UPDATE public."UsersEmailConfirmation" 
            SET "isConfirmed"=$1, "confirmationCode"=$2, "codeExpirationDate"=$3
            WHERE "userId" = $4`,
      [
        user.emailConfirmation.isConfirmed,
        user.emailConfirmation.confirmationCode,
        user.emailConfirmation.codeExpirationDate,
        user.id,
      ],
    );
  }
}

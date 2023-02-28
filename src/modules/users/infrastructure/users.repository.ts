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
            LEFT JOIN public."AccountData" ac 
            ON ac."ownerId" = u.id
            LEFT JOIN public."EmailConfirmation" e
            ON e."ownerId" = u.id
            LEFT JOIN public."BanInfo" b
            ON b."ownerId" = u.id
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
            LEFT JOIN public."AccountData" ac 
            ON ac."ownerId" = u.id
            LEFT JOIN public."EmailConfirmation" e
            ON e."ownerId" = u.id
            LEFT JOIN public."BanInfo" b
            ON b."ownerId" = u.id
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
            LEFT JOIN public."AccountData" ac 
            ON ac."ownerId" = u.id
            LEFT JOIN public."EmailConfirmation" e
            ON e."ownerId" = u.id
            LEFT JOIN public."BanInfo" b
            ON b."ownerId" = u.id
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
            LEFT JOIN public."AccountData" ac 
            ON ac."ownerId" = u.id
            LEFT JOIN public."EmailConfirmation" e
            ON e."ownerId" = u.id
            LEFT JOIN public."BanInfo" b
            ON b."ownerId" = u.id
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
      `INSERT INTO public."AccountData"("createdAt", "login", "passwordHash", "email", "ownerId")	VALUES ($1, $2, $3, $4, $5);`,
      [
        user.accountData.createdAt,
        user.accountData.login,
        user.accountData.passwordHash,
        user.accountData.email,
        user.id,
      ],
    );
    await this.dataSource.query(
      `INSERT INTO public."EmailConfirmation"("isConfirmed", "confirmationCode", "codeExpirationDate",  "ownerId")	VALUES ($1, $2, $3, $4);`,
      [
        user.emailConfirmation.isConfirmed,
        user.emailConfirmation.confirmationCode,
        user.emailConfirmation.codeExpirationDate,
        user.id,
      ],
    );
    await this.dataSource.query(
      `INSERT INTO public."BanInfo"("isBanned", "banDate", "banReason", "ownerId")	VALUES ($1, $2, $3, $4);`,
      [user.banInfo.isBanned, user.banInfo.banDate, user.banInfo.banReason, user.id],
    );
  }

  async deleteUser(userId: string) {
    await this.dataSource.query(
      `DELETE FROM public."BanInfo" WHERE "ownerId" = '${userId}';
             DELETE FROM public."AccountData" WHERE "ownerId" = '${userId}';
             DELETE FROM public."EmailConfirmation" WHERE "ownerId" = '${userId}';
             DELETE FROM public."Users" WHERE "id" = '${userId}';`,
    );
  }

  async deleteAllUsers() {
    await this.dataSource.query(
      `DELETE FROM public."BanInfo";
             DELETE FROM public."AccountData";
             DELETE FROM public."EmailConfirmation";
             DELETE FROM public."Users";`,
    );
  }

  async deleteAllBannedUsersForBlogs() {
    await this.dataSource.query(`DELETE FROM public."BannedUsersForBlog"`);
  }

  async findBannedUserForBlog(blogId: string, userId: string): Promise<BannedUserForBlog | null> {
    const bannedUserForBlogFromDB: BannedUserForBlogFromDB = (
      await this.dataSource.query(`SELECT * FROM public."BannedUsersForBlog" WHERE "id" = $1 AND "blogId" = $2`, [
        userId,
        blogId,
      ])
    )[0];

    if (!bannedUserForBlogFromDB) return null;
    return BannedUserForBlog.createBannedUserForBlog(bannedUserForBlogFromDB);
  }

  async saveBannedUserForBlog(bannedUserForBlog: BannedUserForBlog) {
    await this.dataSource.query(
      `INSERT INTO public."BannedUsersForBlog"("id", "login", "banReason", "banDate", "blogId")	VALUES ($1, $2, $3, $4, $5);`,
      [
        bannedUserForBlog.id,
        bannedUserForBlog.login,
        bannedUserForBlog.banReason,
        bannedUserForBlog.banDate,
        bannedUserForBlog.blogId,
      ],
    );
  }

  async deleteBannedUserForBlog(userId: string) {
    await this.dataSource.query(`DELETE FROM public."BannedUsersForBlog" WHERE "id" = $1`, [userId]);
  }

  async updateBanInfo(user: User) {
    await this.dataSource.query(
      `UPDATE public."BanInfo" 
            SET "isBanned"=$1, "banReason"=$2, "banDate"=$3
            WHERE "ownerId" = $4`,
      [user.banInfo.isBanned, user.banInfo.banReason, user.banInfo.banDate, user.id],
    );
  }

  async updatePasswordHash(user: User) {
    await this.dataSource.query(
      `UPDATE public."AccountData" 
            SET "passwordHash"=$1
            WHERE "ownerId" = $2`,
      [user.accountData.passwordHash, user.id],
    );
  }

  async updateEmailConfirmation(user: User) {
    await this.dataSource.query(
      `UPDATE public."EmailConfirmation" 
            SET "isConfirmed"=$1, "confirmationCode"=$2, "codeExpirationDate"=$3
            WHERE "ownerId" = $4`,
      [
        user.emailConfirmation.isConfirmed,
        user.emailConfirmation.confirmationCode,
        user.emailConfirmation.codeExpirationDate,
        user.id,
      ],
    );
  }
}

import { User } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BannedUserForBlog } from '../domain/banned-user-for-blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepositoryT: Repository<User>,
    @InjectRepository(BannedUserForBlog) private readonly bannedUsersForBlogRepositoryT: Repository<BannedUserForBlog>,
  ) {}

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const foundUser = await this.usersRepositoryT.findOne({
      where: { accountData: [{ login: ILike(loginOrEmail) }, { email: ILike(loginOrEmail) }] },
    });

    return foundUser ?? null;
  }

  async findUserLoginByIdOrThrowError(userId: string): Promise<string> {
    const foundUser = await this.usersRepositoryT.findOne({
      where: { id: userId },
    });

    if (!foundUser) throw new NotFoundException('user not found');
    return foundUser.accountData.login;
  }

  async findUserById(userId: string): Promise<User | null> {
    const foundUser = await this.usersRepositoryT.findOne({
      where: { id: userId },
    });

    return foundUser ?? null;
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    const foundUser = await this.usersRepositoryT.findOne({
      where: { emailConfirmation: { confirmationCode: confirmationCode } },
    });

    return foundUser ?? null;
  }

  async saveUser(user: User): Promise<void> {
    await this.usersRepositoryT.save(user);
  }

  async deleteUser(userId: string) {
    await this.usersRepositoryT.delete({ id: userId });
  }

  async deleteAllUsers() {
    await this.usersRepositoryT.delete({});
  }

  async findBannedUserForBlog(blogId: string, userId: string): Promise<BannedUserForBlog | null> {
    const foundBannedUser = await this.bannedUsersForBlogRepositoryT.findOne({
      where: { userId: userId, blogId: blogId },
    });

    return foundBannedUser ?? null;
  }

  async saveBannedUserForBlog(bannedUserForBlog: BannedUserForBlog) {
    await this.bannedUsersForBlogRepositoryT.save(bannedUserForBlog);
  }

  async deleteBannedUserForBlog(userId: string, blogId: string) {
    await this.bannedUsersForBlogRepositoryT.delete({ blogId: blogId, userId: userId });
  }

  async deleteAllBannedUsersForBlogs() {
    await this.bannedUsersForBlogRepositoryT.clear();
  }
}

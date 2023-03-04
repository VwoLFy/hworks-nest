import { User } from '../domain/user.entity';
import { UserViewModel } from '../api/models/UserViewModel';
import { FindUsersQueryModel } from '../api/models/FindUsersQueryModel';
import { Injectable } from '@nestjs/common';
import { BanStatuses } from '../../../main/types/enums';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { FindBannedUsersForBlogQueryModel } from '../api/models/FindBannedUsersForBlogQueryModel';
import { BannedUserForBlogViewModel } from '../api/models/BannedUserForBlogViewModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BannedUserForBlog } from '../domain/banned-user-for-blog.entity';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(User) private readonly usersRepositoryT: Repository<User>,
    @InjectRepository(BannedUserForBlog) private readonly bannedUsersForBlogRepositoryT: Repository<BannedUserForBlog>,
  ) {}

  async findUsers(dto: FindUsersQueryModel): Promise<PageViewModel<UserViewModel>> {
    const { banStatus, searchLoginTerm, searchEmailTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    let isBanned: boolean = null;
    if (banStatus === BanStatuses.banned) isBanned = true;
    if (banStatus === BanStatuses.notBanned) isBanned = false;

    let login = `%${searchLoginTerm}%`;
    let email = `%${searchEmailTerm}%`;
    if (searchLoginTerm && !searchEmailTerm) {
      email = null;
    } else if (!searchLoginTerm && searchEmailTerm) {
      login = null;
    }

    const [foundUsers, totalCount] = await this.usersRepositoryT.findAndCount({
      where: {
        banInfo: { isBanned: isBanned }, //если null, то игнорируется поиск
        accountData: [{ login: ILike(login) }, { email: ILike(email) }],
      },
      order: { accountData: { [sortBy]: sortDirection } },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

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
    const foundUser = await this.usersRepositoryT.findOne({ where: { id: id } });
    return new UserViewModel(foundUser);
  }

  async findBannedUsersForBlog(
    blogId: string,
    dto: FindBannedUsersForBlogQueryModel,
  ): Promise<PageViewModel<BannedUserForBlogViewModel>> {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    const [foundUsers, totalCount] = await this.bannedUsersForBlogRepositoryT.findAndCount({
      where: { blogId: blogId, userLogin: ILike(`%${searchLoginTerm}%`) },
      order: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const pagesCount = Math.ceil(totalCount / pageSize);

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

import { User } from '../domain/user.entity';
import { UserViewModel } from '../../sa.users/api/models/UserViewModel';
import { FindUsersQueryModel } from '../../sa.users/api/models/FindUsersQueryModel';
import { Injectable } from '@nestjs/common';
import { BanStatuses } from '../../../main/types/enums';
import { PageViewModel } from '../../../main/types/PageViewModel';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepo {
  constructor(@InjectRepository(User) private readonly usersRepositoryT: Repository<User>) {}

  async findUsers(dto: FindUsersQueryModel): Promise<PageViewModel<UserViewModel>> {
    const { banStatus, searchLoginTerm, searchEmailTerm, pageNumber, pageSize, sortBy, sortDirection } = dto;

    let isBanned: boolean = null;
    if (banStatus === BanStatuses.banned) isBanned = true;
    if (banStatus === BanStatuses.notBanned) isBanned = false;

    let searchLogin = `%${searchLoginTerm}%`;
    let searchEmail = `%${searchEmailTerm}%`;
    if (searchLoginTerm && !searchEmailTerm) {
      searchEmail = null;
    } else if (!searchLoginTerm && searchEmailTerm) {
      searchLogin = null;
    }

    const [foundUsers, totalCount] = await this.usersRepositoryT.findAndCount({
      where: {
        banInfo: { isBanned: isBanned }, //если null, то игнорируется поиск
        accountData: [{ login: ILike(searchLogin) }, { email: ILike(searchEmail) }],
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
}

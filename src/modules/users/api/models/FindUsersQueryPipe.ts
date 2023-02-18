import { PipeTransform } from '@nestjs/common';
import { BanStatuses } from '../../../../main/types/enums';
import { FindUsersQueryModel } from './FindUsersQueryModel';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';

class FindUsersQueryPipe extends BasicQueryPipe implements PipeTransform<any, FindUsersQueryModel> {
  transform(query: any): FindUsersQueryModel {
    const fields = ['id', 'login', 'email', 'createdAt'];
    const preparedQuery = this.transformBasic(query, fields);

    const searchLoginTerm = query.searchLoginTerm || '';
    const searchEmailTerm = query.searchEmailTerm || '';

    let banStatus = query.banStatus;
    const statuses = [BanStatuses.banned, BanStatuses.notBanned];
    banStatus = statuses.includes(banStatus) ? banStatus : BanStatuses.all;

    return { ...preparedQuery, searchLoginTerm, searchEmailTerm, banStatus };
  }
}

export const findUsersQueryPipe = new FindUsersQueryPipe();

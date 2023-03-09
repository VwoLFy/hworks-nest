import { IsOptional } from 'class-validator';
import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';
import { BanStatuses } from '../../../../main/types/enums';

export class FindUsersQueryModel extends BasicQueryModel {
  @IsOptional()
  searchLoginTerm;

  @IsOptional()
  searchEmailTerm;

  @IsOptional()
  banStatus: BanStatuses;
}

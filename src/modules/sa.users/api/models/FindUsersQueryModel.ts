import { IsOptional } from 'class-validator';
import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';
import { BanStatuses } from '../../../../main/types/enums';

export class FindUsersQueryModel extends BasicQueryModel {
  @IsOptional()
  searchLoginTerm: string;

  @IsOptional()
  searchEmailTerm: string;

  @IsOptional()
  banStatus: BanStatuses;
}

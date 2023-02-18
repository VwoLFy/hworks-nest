import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';
import { IsOptional } from 'class-validator';

export class FindBannedUsersForBlogQueryModel extends BasicQueryModel {
  @IsOptional()
  searchLoginTerm: string;
}

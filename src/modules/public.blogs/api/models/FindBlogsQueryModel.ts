import { IsOptional } from 'class-validator';
import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';

export class FindBlogsQueryModel extends BasicQueryModel {
  @IsOptional()
  searchNameTerm: string;
}

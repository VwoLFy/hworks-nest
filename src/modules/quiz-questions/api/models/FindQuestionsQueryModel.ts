import { IsOptional } from 'class-validator';
import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';
import { PublishedStatuses } from './QueryPublishedStatuses';

export class FindQuestionsQueryModel extends BasicQueryModel {
  @IsOptional()
  bodySearchTerm: string;

  @IsOptional()
  publishedStatus: PublishedStatuses;
}

import { SortDirection } from './enums';
import { IsOptional } from 'class-validator';

export class BasicQueryModel {
  @IsOptional()
  pageNumber: number;

  @IsOptional()
  pageSize: number;

  @IsOptional()
  sortBy: string;

  @IsOptional()
  sortDirection: SortDirection;
}

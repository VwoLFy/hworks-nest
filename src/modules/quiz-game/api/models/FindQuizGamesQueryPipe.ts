import { PipeTransform } from '@nestjs/common';
import { BasicQueryPipe } from '../../../../main/types/BasicQueryPipe';
import { BasicQueryModel } from '../../../../main/types/BasicQueryModel';

class FindQuizGamesQueryPipe extends BasicQueryPipe implements PipeTransform<any, BasicQueryModel> {
  transform(query: any): BasicQueryModel {
    const sortFields = ['id', 'status', 'pairCreatedDate', 'startGameDate', 'finishGameDate'];
    return this.transformBasic(query, sortFields, 'pairCreatedDate');
  }
}

export const findQuizGamesQueryPipe = new FindQuizGamesQueryPipe();

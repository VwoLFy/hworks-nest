import { Statistic } from '../../domain/quiz-game.statistic.entity';

export class MyStatisticViewModel {
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  sumScore: number;
  avgScores: number;
  constructor(dto: Statistic) {
    this.gamesCount = dto.gamesCount;
    this.winsCount = dto.winsCount;
    this.lossesCount = dto.lossesCount;
    this.drawsCount = dto.drawsCount;
    this.sumScore = dto.sumScore;
    this.avgScores = dto.avgScores;
  }
}

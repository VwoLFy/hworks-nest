import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { GameResult } from '../application/enums';
import { Player } from './quiz-game.player.entity';

@Entity('QuizGameStatistic')
export class Statistic {
  @PrimaryColumn('uuid')
  userId: string;
  @Column()
  gamesCount: number;
  @Column()
  winsCount: number;
  @Column()
  lossesCount: number;
  @Column()
  drawsCount: number;
  @Column()
  sumScore: number;
  @Column('double precision')
  avgScores: number;
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  constructor(userId: string) {
    this.userId = userId;
    this.gamesCount = 0;
    this.winsCount = 0;
    this.lossesCount = 0;
    this.drawsCount = 0;
    this.sumScore = 0;
    this.avgScores = 0;
  }

  public processGameResult(player: Player) {
    this.gamesCount++;
    player.gameResult === GameResult.win
      ? this.winsCount++
      : player.gameResult === GameResult.lose
      ? this.lossesCount++
      : this.drawsCount++;
    this.sumScore += player.score;
    this.avgScores = Math.round((this.sumScore / this.gamesCount) * 100) / 100;
  }
}

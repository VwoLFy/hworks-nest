import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quiz-game.controller';
import { QuizGameRepository } from './infrastructure/quiz-game.repository';
import { ConnectUserToGameUseCase } from './application/use-cases/connect-user-to-game-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizGame } from './domain/quiz-game.entity';
import { Player } from './domain/quiz-game.player.entity';
import { Answer } from './domain/quiz-game.answer.entity';
import { QuizGameQueryRepo } from './infrastructure/quiz-game.queryRepo';
import { SaQuizModule } from '../quiz-questions/sa.quiz.module';
import { SendAnswerUseCase } from './application/use-cases/send-answer-use-case';
import { QuizQuestionToGame } from './domain/quiz-game.game-to-question.entity';
import { Statistic } from './domain/quiz-game.statistic.entity';

const useCases = [ConnectUserToGameUseCase, SendAnswerUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizGame, Player, Answer, QuizQuestionToGame, Statistic]),
    CqrsModule,
    UsersModule,
    SaQuizModule,
  ],
  controllers: [QuizGameController],
  providers: [QuizGameQueryRepo, QuizGameRepository, ...useCases],
})
export class QuizGameModule {}

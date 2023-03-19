import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/api/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UserId } from '../../../main/decorators/user.decorator';
import { ConnectUserToGameCommand } from '../application/use-cases/connect-user-to-game-use-case';
import { QuizGameQueryRepo } from '../infrastructure/quiz-game.queryRepo';
import { GamePairViewModel } from './models/GamePairViewModel';
import { AnswerInputDto } from '../application/dto/AnswerInputDto';
import { HTTP_Status } from '../../../main/types/enums';
import { AnswerViewModel } from './models/AnswerViewModel';
import { SendAnswerCommand } from '../application/use-cases/send-answer-use-case';

@Controller('pair-game-quiz/pairs')
@UseGuards(JwtAuthGuard)
export class QuizGameController {
  constructor(private commandBus: CommandBus, private quizGameQueryRepo: QuizGameQueryRepo) {}

  @Get('my-current')
  async findUserCurrentGame(@UserId() userId: string): Promise<GamePairViewModel> {
    return await this.quizGameQueryRepo.findUsersCurrentGame(userId);
  }

  @Get(':gameId')
  async findGameById(
    @UserId() userId: string,
    @Param('gameId', ParseUUIDPipe) gameId: string,
  ): Promise<GamePairViewModel> {
    const game = await this.quizGameQueryRepo.findGameById(gameId);
    if (
      !(
        game.firstPlayerProgress.player.id === userId ||
        (game.secondPlayerProgress && game.secondPlayerProgress.player.id === userId)
      )
    )
      throw new ForbiddenException('you are not participant of this game');
    return game;
  }

  @Post('connection')
  @HttpCode(HTTP_Status.OK_200)
  async connection(@UserId() userId: string): Promise<GamePairViewModel> {
    const gameId = await this.commandBus.execute(new ConnectUserToGameCommand(userId));
    return await this.quizGameQueryRepo.findGameById(gameId);
  }

  @Post('my-current/answers')
  @HttpCode(HTTP_Status.OK_200)
  async sendAnswer(@UserId() userId: string, @Body() dto: AnswerInputDto): Promise<AnswerViewModel> {
    const answerId = await this.commandBus.execute(new SendAnswerCommand(userId, dto));
    return this.quizGameQueryRepo.findAnswerById(answerId);
  }
}

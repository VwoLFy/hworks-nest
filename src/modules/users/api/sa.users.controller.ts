import { UsersQueryRepo } from '../infrastructure/users.queryRepo';
import { FindUsersQueryModel } from './models/FindUsersQueryModel';
import { UserViewModel } from './models/UserViewModel';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { findUsersQueryPipe } from './models/FindUsersQueryPipe';
import { checkObjectIdPipe } from '../../../main/checkObjectIdPipe';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { DeleteUserCommand } from '../application/use-cases/delete-user-use-case';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserDto } from '../application/dto/BanUserDto';
import { BanUserCommand } from '../application/use-cases/ban-user-use-case';
import { PageViewModel } from '../../../main/types/PageViewModel';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersControllerSA {
  constructor(protected usersQueryRepo: UsersQueryRepo, private commandBus: CommandBus) {}

  @Get()
  async findUsers(@Query(findUsersQueryPipe) query: FindUsersQueryModel): Promise<PageViewModel<UserViewModel>> {
    return await this.usersQueryRepo.findUsers(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<UserViewModel> {
    const createdUserId = await this.commandBus.execute(new CreateUserCommand(body));

    return await this.usersQueryRepo.findUserById(createdUserId);
  }

  @Put(':id/ban')
  @HttpCode(204)
  async banUser(@Param('id', checkObjectIdPipe) userId: string, @Body() body: BanUserDto) {
    await this.commandBus.execute(new BanUserCommand(userId, body));
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id', checkObjectIdPipe) userId: string) {
    await this.commandBus.execute(new DeleteUserCommand(userId));
  }
}

import { UsersQueryRepo } from '../infrastructure/users.queryRepo';
import { FindUsersQueryModel } from './models/FindUsersQueryModel';
import { UserViewModelPage } from './models/UserViewModelPage';
import { UserViewModel } from './models/UserViewModel';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { findUsersQueryPipe } from './models/FindUsersQueryPipe';
import { checkObjectIdPipe } from '../../main/checkObjectIdPipe';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';
import { DeleteUserUseCase } from '../application/use-cases/delete-user-use-case';
import { CreateUserUseCase } from '../application/use-cases/create-user-use-case';

@Controller('users')
export class UsersController {
  constructor(
    protected usersQueryRepo: UsersQueryRepo,
    protected createUserUseCase: CreateUserUseCase,
    protected deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  async getUsers(@Query(findUsersQueryPipe) query: FindUsersQueryModel): Promise<UserViewModelPage> {
    return await this.usersQueryRepo.findUsers(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserDto): Promise<UserViewModel> {
    const createdUserId = await this.createUserUseCase.execute(body);

    return await this.usersQueryRepo.findUserById(createdUserId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', checkObjectIdPipe) userId: string) {
    await this.deleteUserUseCase.execute(userId);
  }
}

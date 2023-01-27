import { UsersQueryRepo } from '../infrastructure/users-queryRepo';
import { UsersService } from '../application/user-service';
import { FindUsersQueryModel } from './models/FindUsersQueryModel';
import { UserViewModelPage } from './models/UserViewModelPage';
import { UserViewModel } from './models/UserViewModel';
import { HTTP_Status } from '../../main/types/enums';
import { CreateUserDto } from '../application/dto/CreateUserDto';
import { Body, Controller, Delete, Get, HttpCode, HttpException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { findUsersQueryPipe } from './models/FindUsersQueryPipe';
import { checkObjectIdPipe } from '../../main/checkObjectIdPipe';
import { BasicAuthGuard } from '../../auth/api/guards/basic-auth.guard';

@Controller('users')
export class UsersController {
  constructor(protected usersQueryRepo: UsersQueryRepo, protected usersService: UsersService) {}

  @Get()
  async getUsers(@Query(findUsersQueryPipe) query: FindUsersQueryModel): Promise<UserViewModelPage> {
    return await this.usersQueryRepo.findUsers(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserDto): Promise<UserViewModel> {
    const createdUserId = await this.usersService.createUser(body);
    if (!createdUserId) throw new HttpException('login or email is already exist', HTTP_Status.BAD_REQUEST_400);

    return await this.usersQueryRepo.findUserById(createdUserId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', checkObjectIdPipe) userId: string) {
    const isDeletedUser = await this.usersService.deleteUser(userId);
    if (!isDeletedUser) throw new HttpException('user not found', HTTP_Status.NOT_FOUND_404);
  }
}

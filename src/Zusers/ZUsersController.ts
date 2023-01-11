import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZUsersService } from './z-users.service';
import { ZUser } from './ZUserSchema';

@Controller('Zusers')
export class ZUsersController {
  constructor(protected zUsersService: ZUsersService) {}

  @Get()
  async getUsers(
    @Query() query: { searchEmailTerm: string },
  ): Promise<ZUser[] | null> {
    return await this.zUsersService.findUsers(query.searchEmailTerm);
  }

  @Get(':id')
  getUser(@Param('id') userID) {
    return [{ id: 1 }, { id: 2 }].find((u) => u.id === +userID);
  }
  @Put(':id')
  updateUser(@Param('id') userID, @Body('name') name: string) {
    console.log(name);
    return this.zUsersService.updateUser(userID, name);
  }
  @Post()
  async createUser(@Body() input: InputModelType): Promise<ZUser> {
    return this.zUsersService.createUser(input);
  }
  @Delete(':id')
  deleteUser(@Param('id') userId) {
    return [
      { id: 1, name: 'Wolfy' },
      { id: 2, name: 'Vitalii' },
    ].filter((u) => u.id !== +userId);
  }
}

export type InputModelType = {
  name: string;
  age: number;
};

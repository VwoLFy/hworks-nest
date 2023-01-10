import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(protected usersService: UsersService) {}

  @Get()
  getUsers(@Query() query: { searchEmailTerm: string }) {
    console.log(query);
    return this.usersService.findUsers(query.searchEmailTerm);
  }

  @Get(':id')
  getUser(@Param('id') userID) {
    return [{ id: 1 }, { id: 2 }].find((u) => u.id === +userID);
  }
  @Post()
  createUser(@Body() input: InputModelType) {
    return {
      id: 7,
      name: input.name,
      age: input.age,
    };
  }
  @Delete(':id')
  deleteUser(@Param('id') userId) {
    return [
      { id: 1, name: 'Wolfy' },
      { id: 2, name: 'Vitalii' },
    ].filter((u) => u.id !== +userId);
  }
}

type InputModelType = {
  name: string;
  age: number;
};

import { UsersRepository } from './users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository) {}
  findUsers(term) {
    return this.usersRepository.findUsers(term);
  }
}

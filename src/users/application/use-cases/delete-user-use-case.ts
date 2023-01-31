import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(protected usersRepository: UsersRepository) {}

  async execute(_id: string) {
    await this.usersRepository.deleteUser(new ObjectId(_id));
  }
}

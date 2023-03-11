import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async createUser(dto: CreateUserDto, isConfirmed: boolean): Promise<User> {
    const { login, password, email } = dto;
    const passwordHash = await this.getPasswordHash(password);

    const user = new User(login, passwordHash, email, isConfirmed);
    await this.usersRepository.saveUser(user);

    return user;
  }

  private async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }
}

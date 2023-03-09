import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';
import { BanUserDto } from '../../sa.users/application/dto/BanUserDto';

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

  async banUser(userId: string, dto: BanUserDto): Promise<boolean> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new NotFoundException('user not found');
    if (user.banInfo.isBanned === dto.isBanned) return true;

    user.banUser(dto);
    await this.usersRepository.saveUser(user);
    return false;
  }

  private async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }
}

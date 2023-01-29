import { UsersRepository } from '../../infrastructure/users.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/CreateUserDto';
import { User, AccountData, UserDocument, EmailConfirmation } from '../../domain/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  async execute(dto: CreateUserDto): Promise<string | null> {
    const { login, password, email } = dto;

    const isFreeLoginAndEmail = await this.usersRepository.isFreeLoginAndEmail(login, email);
    if (!isFreeLoginAndEmail) return null;

    const passwordHash = await this.getPasswordHash(password);

    const accountData = new AccountData(login, passwordHash, email);
    const emailConfirmation = new EmailConfirmation(true);
    const user = new this.UserModel({ accountData, emailConfirmation });

    await this.usersRepository.saveUser(user);
    return user.id;
  }
  private async getPasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, passwordSalt);
  }
}

import { User } from './domain/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './infrastructure/users.repository';
import { BanInfo } from './domain/user.ban-info.entity';
import { AccountData } from './domain/user.account-data.entity';
import { UsersQueryRepo } from './infrastructure/users.queryRepo';
import { EmailConfirmation } from './domain/user.email-confirmation.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';

const entities = [User, BanInfo, AccountData, EmailConfirmation];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  providers: [UsersService, UsersQueryRepo, UsersRepository],
  exports: [UsersService, UsersRepository, UsersQueryRepo],
})
export class UsersModule {}

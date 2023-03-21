import { User } from './domain/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './infrastructure/users.repository';
import { BanInfo } from './domain/user.ban-info.entity';
import { AccountData } from './domain/user.account-data.entity';
import { UsersQueryRepo } from './infrastructure/users.queryRepo';
import { EmailConfirmation } from './domain/user.email-confirmation.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityModule } from '../security/security.module';
import { UsersController } from './api/users.controller';
import { IsFreeLoginOrEmailConstraint } from '../../main/decorators/is-free-login-or-email.decorator';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { BanUserUseCase } from './application/use-cases/ban-user-use-case';

const useCases = [CreateUserUseCase, DeleteUserUseCase, BanUserUseCase];

const entities = [User, BanInfo, AccountData, EmailConfirmation];

@Module({
  imports: [TypeOrmModule.forFeature(entities), CqrsModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService, UsersQueryRepo, UsersRepository, IsFreeLoginOrEmailConstraint, ...useCases],
  exports: [UsersService, UsersRepository, UsersQueryRepo],
})
export class UsersModule {}

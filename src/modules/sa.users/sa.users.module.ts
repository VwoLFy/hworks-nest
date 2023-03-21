import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { BanUserUseCase } from './application/use-cases/ban-user-use-case';
import { IsFreeLoginOrEmailConstraint } from '../../main/decorators/is-free-login-or-email.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersController } from './api/sa.users.controller';
import { UsersModule } from '../users/users.module';
import { SecurityModule } from '../security/security.module';

const useCases = [CreateUserUseCase, DeleteUserUseCase, BanUserUseCase];

@Module({
  imports: [CqrsModule, UsersModule, SecurityModule],
  controllers: [SaUsersController],
  providers: [IsFreeLoginOrEmailConstraint, ...useCases],
})
export class SaUsersModule {}

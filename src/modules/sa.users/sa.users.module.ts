import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user-use-case';
import { BanUserUseCase } from './application/use-cases/ban-user-use-case';
import { IsFreeLoginOrEmailConstraint } from '../../main/decorators/is-free-login-or-email.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { SaUsersController } from './api/sa.users.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { CommentsModule } from '../comments/comments.module';
import { PostsModule } from '../posts/posts.module';

const useCases = [CreateUserUseCase, DeleteUserUseCase, BanUserUseCase];

@Module({
  imports: [CqrsModule, UsersModule, AuthModule, CommentsModule, PostsModule],
  controllers: [SaUsersController],
  providers: [IsFreeLoginOrEmailConstraint, ...useCases],
})
export class SaUsersModule {}

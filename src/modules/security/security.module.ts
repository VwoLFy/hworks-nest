import { DeleteSessionUseCase } from './application/use-cases/delete-session-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteSessionsExceptCurrentUseCase } from './application/use-cases/delete-sessions-except-current-use-case';
import { ApiJwtModule } from '../api-jwt/api-jwt.module';
import { SecurityController } from './api/security.controller';
import { SecurityService } from './application/security.service';
import { SecurityRepository } from './infrastructure/security.repository';
import { SecurityQueryRepo } from './infrastructure/security.queryRepo';
import { CqrsModule } from '@nestjs/cqrs';
import { Session } from './domain/session.entity';
import { Module } from '@nestjs/common';

const useCases = [DeleteSessionUseCase, DeleteSessionsExceptCurrentUseCase];

const entities = [Session];

@Module({
  imports: [TypeOrmModule.forFeature(entities), CqrsModule, ApiJwtModule],
  controllers: [SecurityController],
  providers: [SecurityRepository, SecurityQueryRepo, SecurityService, ...useCases],
  exports: [SecurityService, SecurityRepository],
})
export class SecurityModule {}

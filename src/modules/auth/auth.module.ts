import { BasicStrategy } from './api/strategies/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { ApiConfigModule } from '../../main/configuration/api.config.module';
import { Module } from '@nestjs/common';
import { LocalStrategy } from './api/strategies/local.strategy';
import { AuthService } from './application/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './api/strategies/jwt.strategy';
import { AuthController } from './api/auth.controller';
import { AttemptsService } from './application/attempts.service';
import { AttemptsRepository } from './infrastructure/attempts.repository';
import { AttemptsData } from './domain/attempts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ChangePasswordUseCase } from './application/use-cases/change-password-use-case';
import { PasswordRecoveryRepository } from './infrastructure/password-recovery.repository';
import { PasswordRecovery } from './domain/password-recovery.entity';
import { GenerateNewTokensUseCase } from './application/use-cases/generate-new-tokens-use-case';
import { LoginUserUseCase } from './application/use-cases/login-user-use-case';
import { SendPasswordRecoveryEmailUseCase } from './application/use-cases/send-password-recovery-email-use-case';
import { EmailService } from './application/email.service';
import { EmailAdapter } from './infrastructure/email.adapter';
import { ResendRegistrationEmailUseCase } from './application/use-cases/resend-registration-email-use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user-use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email-use-case';
import { ApiJwtModule } from '../api-jwt/api-jwt.module';
import { SecurityModule } from '../security/security.module';

const useCases = [
  ChangePasswordUseCase,
  ConfirmEmailUseCase,
  RegisterUserUseCase,
  ResendRegistrationEmailUseCase,
  SendPasswordRecoveryEmailUseCase,
  LoginUserUseCase,
  GenerateNewTokensUseCase,
];

const entities = [AttemptsData, PasswordRecovery];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    PassportModule,
    ApiConfigModule,
    UsersModule,
    CqrsModule,
    ApiJwtModule,
    SecurityModule,
  ],
  controllers: [AuthController],
  providers: [
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    AttemptsRepository,
    AuthService,
    PasswordRecoveryRepository,
    AttemptsService,
    EmailService,
    EmailAdapter,
    ...useCases,
  ],
  exports: [AttemptsRepository, PasswordRecoveryRepository],
})
export class AuthModule {}

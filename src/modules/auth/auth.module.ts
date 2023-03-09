import { BasicStrategy } from './api/strategies/basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ApiConfigService } from '../../main/configuration/api.config.service';
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
import { ApiJwtService } from './application/api-jwt.service';
import { SecurityService } from '../security/application/security.service';
import { SecurityRepository } from '../security/infrastructure/security.repository';
import { Session } from '../security/domain/session.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { SecurityController } from '../security/api/security.controller';
import { SecurityQueryRepo } from '../security/infrastructure/security.queryRepo';
import { ChangePasswordUseCase } from './application/use-cases/change-password-use-case';
import { PasswordRecoveryRepository } from './infrastructure/password-recovery.repository';
import { PasswordRecovery } from './domain/password-recovery.entity';
import { GenerateNewTokensUseCase } from './application/use-cases/generate-new-tokens-use-case';
import { DeleteSessionUseCase } from '../security/application/use-cases/delete-session-use-case';
import { DeleteSessionsExceptCurrentUseCase } from '../security/application/use-cases/delete-sessions-except-current-use-case';
import { LoginUserUseCase } from './application/use-cases/login-user-use-case';
import { SendPasswordRecoveryEmailUseCase } from './application/use-cases/send-password-recovery-email-use-case';
import { EmailService } from './application/email.service';
import { EmailAdapter } from './infrastructure/email.adapter';
import { ResendRegistrationEmailUseCase } from './application/use-cases/resend-registration-email-use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user-use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email-use-case';

const useCases = [
  ChangePasswordUseCase,
  ConfirmEmailUseCase,
  RegisterUserUseCase,
  ResendRegistrationEmailUseCase,
  SendPasswordRecoveryEmailUseCase,
  LoginUserUseCase,
  DeleteSessionUseCase,
  DeleteSessionsExceptCurrentUseCase,
  GenerateNewTokensUseCase,
];

const entities = [AttemptsData, Session, PasswordRecovery];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    JwtModule.registerAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          secret: apiConfigService.JWT_SECRET_FOR_ACCESSTOKEN,
          signOptions: { expiresIn: apiConfigService.EXPIRES_IN_TIME_OF_ACCESSTOKEN },
        };
      },
    }),
    PassportModule,
    ApiConfigModule,
    UsersModule,
    CqrsModule,
  ],
  controllers: [AuthController, SecurityController],
  providers: [
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    AttemptsRepository,
    AuthService,
    ApiJwtService,
    PasswordRecoveryRepository,
    SecurityRepository,
    SecurityQueryRepo,
    SecurityService,
    AttemptsService,
    EmailService,
    EmailAdapter,
    ...useCases,
  ],
  exports: [SecurityService, SecurityRepository, AttemptsRepository, PasswordRecoveryRepository, ApiJwtService],
})
export class AuthModule {}

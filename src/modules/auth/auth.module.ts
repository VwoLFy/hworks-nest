// import { ConfirmEmailUseCase } from './application/use-cases/confirm-email-use-case';
// import { RegisterUserUseCase } from './application/use-cases/register-user-use-case';
// import { ResendRegistrationEmailUseCase } from './application/use-cases/resend-registration-email-use-case';
// import { SendPasswordRecoveryEmailUseCase } from './application/use-cases/send-password-recovery-email-use-case';
// import { LoginUserUseCase } from './application/use-cases/login-user-use-case';
// import { DeleteSessionUseCase } from '../security/application/use-cases/delete-session-use-case';
// import { DeleteSessionsExceptCurrentUseCase } from '../security/application/use-cases/delete-sessions-except-current-use-case';
// import { GenerateNewTokensUseCase } from './application/use-cases/generate-new-tokens-use-case';
// import { AttemptsData } from './domain/attempts.entity';
// import { Session } from '../security/domain/session.entity';
// import { PasswordRecovery } from './domain/password-recovery.entity';
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { ApiConfigModule } from '../../main/configuration/api.config.module';
// import { ApiConfigService } from '../../main/configuration/api.config.service';
// import { AuthController } from './api/auth.controller';
// import { SecurityController } from '../security/api/security.controller';
// import { ChangePasswordUseCase } from './application/use-cases/change-password-use-case';
// import { BasicStrategy } from './api/strategies/basic.strategy';
// import { LocalStrategy } from './api/strategies/local.strategy';
// import { JwtStrategy } from './api/strategies/jwt.strategy';
// import { AttemptsRepository } from './infrastructure/attempts.repository';
// import { AuthService } from './application/auth.service';
// import { ApiJwtService } from './application/api-jwt.service';
// import { EmailService } from './application/email.service';
// import { EmailAdapter } from './infrastructure/email.adapter';
// import { PasswordRecoveryRepository } from './infrastructure/password-recovery.repository';
// import { SecurityRepository } from '../security/infrastructure/security.repository';
// import { SecurityQueryRepo } from '../security/infrastructure/security.queryRepo';
// import { SecurityService } from '../security/application/security.service';
// import { AttemptsService } from './application/attempts.service';
// import { UsersRepository } from '../users/infrastructure/users.repository';
//
// const useCases = [
//   ChangePasswordUseCase,
//   ConfirmEmailUseCase,
//   RegisterUserUseCase,
//   ResendRegistrationEmailUseCase,
//   SendPasswordRecoveryEmailUseCase,
//   LoginUserUseCase,
//   DeleteSessionUseCase,
//   DeleteSessionsExceptCurrentUseCase,
//   GenerateNewTokensUseCase,
// ];
//
// const entities = [AttemptsData, Session, PasswordRecovery];
//
// @Module({
//   imports: [
//     TypeOrmModule.forFeature(entities),
//     PassportModule,
//     JwtModule.registerAsync({
//       imports: [ApiConfigModule],
//       inject: [ApiConfigService],
//       useFactory: (apiConfigService: ApiConfigService) => {
//         return {
//           secret: apiConfigService.JWT_SECRET_FOR_ACCESSTOKEN,
//           signOptions: { expiresIn: apiConfigService.EXPIRES_IN_TIME_OF_ACCESSTOKEN },
//         };
//       },
//     }),
//   ],
//   controllers: [AuthController, SecurityController],
//   providers: [
//     BasicStrategy,
//     LocalStrategy,
//     JwtStrategy,
//     AttemptsRepository,
//     AuthService,
//     ApiJwtService,
//     EmailService,
//     EmailAdapter,
//     PasswordRecoveryRepository,
//     SecurityRepository,
//     SecurityQueryRepo,
//     SecurityService,
//     AttemptsService,
//     ApiConfigService,
//     UsersRepository,
//     ...useCases,
//   ],
//   exports: [],
// })
// export class AuthModule {}

import { ApiJwtService } from '../api-jwt.service';
import { TokensType } from '../types/types';
import { SecurityService } from '../../../security/application/security.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LoginUserCommand {
  constructor(public userId: string, public ip: string, public title: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(protected apiJwtService: ApiJwtService, protected securityService: SecurityService) {}

  async execute(command: LoginUserCommand): Promise<TokensType> {
    const { userId, title, ip } = command;

    const tokens = await this.apiJwtService.createJWT(userId, null);
    const refreshTokenData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    await this.securityService.createSession({ ...refreshTokenData, ip, title });
    return tokens;
  }
}

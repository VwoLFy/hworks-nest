import { ApiJwtService } from '../api-jwt.service';
import { TokensType } from '../types/types';
import { SessionDto } from '../../../security/application/dto/SessionDto';
import { SecurityService } from '../../../security/application/security.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GenerateNewTokensCommand {
  constructor(public oldSessionData: SessionDto, public ip: string, public title: string) {}
}

@CommandHandler(GenerateNewTokensCommand)
export class GenerateNewTokensUseCase implements ICommandHandler<GenerateNewTokensCommand> {
  constructor(protected apiJwtService: ApiJwtService, protected securityService: SecurityService) {}

  async execute(command: GenerateNewTokensCommand): Promise<TokensType> {
    const { title, oldSessionData, ip } = command;
    const tokens = await this.apiJwtService.createJWT(oldSessionData.userId, oldSessionData.deviceId);
    const newSessionData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    await this.securityService.updateSession({ ...newSessionData, ip, title });
    return tokens;
  }
}

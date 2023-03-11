import { ApiJwtService } from '../../../api-jwt/api-jwt.service';
import { TokensType } from '../types/types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateNewTokensDto } from '../dto/GenerateNewTokensDto';
import { SessionExtendedDto } from '../../../security/application/dto/SessionExtendedDto';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';

export class GenerateNewTokensCommand {
  constructor(public dto: GenerateNewTokensDto) {}
}

@CommandHandler(GenerateNewTokensCommand)
export class GenerateNewTokensUseCase implements ICommandHandler<GenerateNewTokensCommand> {
  constructor(protected apiJwtService: ApiJwtService, protected securityRepository: SecurityRepository) {}

  async execute(command: GenerateNewTokensCommand): Promise<TokensType> {
    const { title, oldSessionData, ip } = command.dto;
    const tokens = await this.apiJwtService.createJWT(oldSessionData.userId, oldSessionData.deviceId);
    const newSessionData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    await this.updateSession({ ...newSessionData, ip, title });
    return tokens;
  }

  async updateSession(dto: SessionExtendedDto) {
    const foundSession = await this.securityRepository.findSessionByDeviceId(dto.deviceId);
    if (!foundSession) return;

    foundSession.updateSessionData(dto);
    await this.securityRepository.saveSession(foundSession);
  }
}

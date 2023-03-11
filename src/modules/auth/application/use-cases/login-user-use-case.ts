import { ApiJwtService } from '../../../api-jwt/api-jwt.service';
import { TokensType } from '../types/types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityRepository } from '../../../security/infrastructure/security.repository';
import { Session } from '../../../security/domain/session.entity';
import { LoginUserDto } from '../dto/LoginUserDto';

export class LoginUserCommand {
  constructor(public dto: LoginUserDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(protected apiJwtService: ApiJwtService, protected securityRepository: SecurityRepository) {}

  async execute(command: LoginUserCommand): Promise<TokensType> {
    return await this.createSession(command.dto);
  }

  async createSession(dto: LoginUserDto): Promise<TokensType> {
    const { userId, title, ip } = dto;

    const deviceId = await this.newDeviceId();
    const tokens = await this.apiJwtService.createJWT(userId, deviceId);
    const refreshTokenData = await this.apiJwtService.getRefreshTokenData(tokens.refreshToken);

    const session = new Session({ ...refreshTokenData, ip, title });
    await this.securityRepository.saveSession(session);

    return tokens;
  }

  private async newDeviceId(): Promise<string> {
    return String((await this.securityRepository.maxValueActiveDeviceId()) + 1);
  }
}

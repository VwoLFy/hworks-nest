import { SecurityQueryRepo } from '../infrastructure/security.queryRepo';
import { DeleteSessionsExceptCurrentCommand } from '../application/use-cases/delete-sessions-except-current-use-case';
import { DeviceViewModel } from './models/DeviceViewModel';
import { Controller, Delete, Get, HttpCode, Param, UnauthorizedException, UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from '../../../main/guards/refresh-token.guard';
import { SessionData } from '../../../main/decorators/session-data.decorator';
import { DeleteSessionCommand } from '../application/use-cases/delete-session-use-case';
import { SessionDto } from '../application/dto/SessionDto';
import { CommandBus } from '@nestjs/cqrs';

@Controller('security/devices')
export class SecurityController {
  constructor(protected securityQueryRepo: SecurityQueryRepo, private commandBus: CommandBus) {}

  @Get()
  @UseGuards(RefreshTokenGuard)
  async findUserSessions(@SessionData() sessionData: SessionDto): Promise<DeviceViewModel[]> {
    const foundActiveDevices = await this.securityQueryRepo.findUserSessions(sessionData.userId);
    if (!foundActiveDevices) throw new UnauthorizedException();
    return foundActiveDevices;
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteSessionsExceptCurrent(@SessionData() sessionData: SessionDto) {
    return await this.commandBus.execute(
      new DeleteSessionsExceptCurrentCommand(sessionData.userId, sessionData.deviceId),
    );
  }

  @Delete(':id')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteSession(@Param('id') deviceId: string, @SessionData() sessionData: SessionDto) {
    await this.commandBus.execute(new DeleteSessionCommand(sessionData.userId, deviceId));
  }
}

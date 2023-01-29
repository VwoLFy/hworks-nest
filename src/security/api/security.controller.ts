import { SecurityQueryRepo } from '../infrastructure/security.queryRepo';
import { DeleteSessionsExceptCurrentUseCase } from '../application/use-cases/delete-sessions-except-current-use-case';
import { DeviceViewModel } from './models/DeviceViewModel';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenGuard } from '../../main/guards/refresh-token.guard';
import { SessionData } from '../../main/decorators/session-data.decorator';
import { DeleteSessionUseCase } from '../application/use-cases/delete-session-use-case';
import { SessionDto } from '../application/dto/SessionDto';

@Controller('security/devices')
export class SecurityController {
  constructor(
    protected securityQueryRepo: SecurityQueryRepo,
    protected deleteSessionsExceptCurrentUseCase: DeleteSessionsExceptCurrentUseCase,
    protected deleteSessionUseCase: DeleteSessionUseCase,
  ) {}

  @Get()
  @UseGuards(RefreshTokenGuard)
  async getDevices(@SessionData() sessionData: SessionDto): Promise<DeviceViewModel[]> {
    const foundActiveDevices = await this.securityQueryRepo.findUserSessions(sessionData.userId);
    if (!foundActiveDevices) throw new UnauthorizedException();
    return foundActiveDevices;
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteDevices(@SessionData() sessionData: SessionDto) {
    const isDeletedSessions = await this.deleteSessionsExceptCurrentUseCase.execute(
      sessionData.userId,
      sessionData.deviceId,
    );
    if (!isDeletedSessions) throw new UnauthorizedException();
  }

  @Delete(':id')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteDevice(@Param('id') deviceId: string, @SessionData() sessionData: SessionDto) {
    const result = await this.deleteSessionUseCase.execute(sessionData.userId, deviceId);
    if (result !== 204) throw new HttpException('Error delete', result);
  }
}

import { SecurityQueryRepo } from '../infrastructure/security-queryRepo';
import { SecurityService } from '../application/security-service';
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
import { RefreshTokenGuard } from '../../main/guards/refreshToken.guard';
import { Refreshtoken } from '../../main/decorators/refreshtoken.decorator';
import { RefreshTokenDataType } from '../../auth/application/jwt-service';

@Controller('security/devices')
export class SecurityController {
  constructor(protected securityQueryRepo: SecurityQueryRepo, protected securityService: SecurityService) {}

  @Get()
  @UseGuards(RefreshTokenGuard)
  async getDevices(@Refreshtoken() refreshTokenData: RefreshTokenDataType): Promise<DeviceViewModel[]> {
    const foundActiveDevices = await this.securityQueryRepo.findUserSessions(refreshTokenData.userId);
    if (!foundActiveDevices) throw new UnauthorizedException();
    return foundActiveDevices;
  }

  @Delete()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteDevices(@Refreshtoken() refreshTokenData: RefreshTokenDataType) {
    const isDeletedSessions = await this.securityService.deleteSessionsOfUser(
      refreshTokenData.userId,
      refreshTokenData.deviceId,
    );
    if (!isDeletedSessions) throw new UnauthorizedException();
  }

  @Delete(':id')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async deleteDevice(@Param('id') deviceId: string, @Refreshtoken() refreshTokenData: RefreshTokenDataType) {
    const result = await this.securityService.deleteSessionByDeviceId(refreshTokenData.userId, deviceId);
    if (result !== 204) throw new HttpException('Error delete', result);
  }
}

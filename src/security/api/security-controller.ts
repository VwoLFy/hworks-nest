import { SecurityQueryRepo } from '../infrastructure/security-queryRepo';
import { SecurityService } from '../application/security-service';
import { DeviceViewModel } from './models/DeviceViewModel';
import { Controller, Delete, Get, HttpCode, HttpException, Param, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { paramForMongoDB } from '../../main/ParamForMongoDB';

@Controller('security')
export class SecurityController {
  constructor(protected securityQueryRepo: SecurityQueryRepo, protected securityService: SecurityService) {}

  @Get('devices')
  async getDevices(@Req() req: Request): Promise<DeviceViewModel[]> {
    const foundActiveDevices = await this.securityQueryRepo.findUserSessions(req.refreshTokenData.userId);
    if (!foundActiveDevices) throw new UnauthorizedException();
    return foundActiveDevices;
  }

  @Delete('devices')
  @HttpCode(204)
  async deleteDevices(@Req() req: Request) {
    const isDeletedSessions = await this.securityService.deleteSessionsOfUser(
      req.refreshTokenData.userId,
      req.refreshTokenData.deviceId,
    );
    if (!isDeletedSessions) throw new UnauthorizedException();
  }

  @Delete('devices/:id')
  @HttpCode(204)
  async deleteDevice(@Param('id', paramForMongoDB) deviceId: string, @Req() req: Request) {
    const result = await this.securityService.deleteSessionByDeviceId(req.refreshTokenData.userId, deviceId);
    if (result !== 204) throw new HttpException('Error delete', result);
  }
}

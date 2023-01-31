import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SecurityRepository } from '../../infrastructure/security.repository';

@Injectable()
export class DeleteSessionUseCase {
  constructor(protected securityRepository: SecurityRepository) {}

  async execute(userId: string, deviceId: string) {
    const foundSession = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!foundSession) throw new NotFoundException();
    if (foundSession.userId !== userId) throw new ForbiddenException();

    await this.securityRepository.deleteSessionByDeviceId(deviceId);
  }
}

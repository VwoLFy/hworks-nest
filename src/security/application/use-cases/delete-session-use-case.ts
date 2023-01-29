import { Injectable } from '@nestjs/common';
import { SecurityRepository } from '../../infrastructure/security.repository';

@Injectable()
export class DeleteSessionUseCase {
  constructor(protected securityRepository: SecurityRepository) {}

  async execute(userId: string, deviceId: string): Promise<number> {
    const foundSession = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!foundSession) return 404;
    if (foundSession.userId !== userId) return 403;

    return await this.securityRepository.deleteSessionByDeviceId(deviceId);
  }
}

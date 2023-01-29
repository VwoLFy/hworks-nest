import { SecurityRepository } from '../../infrastructure/security.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteSessionsExceptCurrentUseCase {
  constructor(protected securityRepository: SecurityRepository) {}

  async execute(userId: string, deviceId: string): Promise<boolean> {
    return await this.securityRepository.deleteSessionsOfUser(userId, deviceId);
  }
}

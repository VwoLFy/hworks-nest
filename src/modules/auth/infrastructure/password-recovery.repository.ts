import { PasswordRecovery } from '../domain/password-recovery.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectRepository(PasswordRecovery) private readonly passwordRecoveryRepositoryT: Repository<PasswordRecovery>,
  ) {}

  async findPassRecovery(recoveryCode: string): Promise<PasswordRecovery | null> {
    return await this.passwordRecoveryRepositoryT.findOne({
      where: { recoveryCode: recoveryCode },
    });
  }

  async savePassRecovery(passRecovery: PasswordRecovery) {
    await this.passwordRecoveryRepositoryT.save(passRecovery);
  }

  async deletePassRecovery(recoveryCode: string) {
    await this.passwordRecoveryRepositoryT.delete({ recoveryCode: recoveryCode });
  }
}

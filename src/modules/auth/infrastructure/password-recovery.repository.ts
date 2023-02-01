import { PasswordRecovery, PasswordRecoveryDocument } from '../domain/password-recovery.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(@InjectModel(PasswordRecovery.name) private PasswordRecoveryModel: Model<PasswordRecoveryDocument>) {}

  async findPassRecovery(recoveryCode: string): Promise<PasswordRecovery | null> {
    return this.PasswordRecoveryModel.findOne({ recoveryCode }).lean();
  }

  async savePassRecovery(passRecovery: PasswordRecoveryDocument) {
    await passRecovery.save();
  }

  async deletePassRecovery(recoveryCode: string) {
    await this.PasswordRecoveryModel.deleteOne({ recoveryCode });
  }

  async deleteAll() {
    await this.PasswordRecoveryModel.deleteMany();
  }
}

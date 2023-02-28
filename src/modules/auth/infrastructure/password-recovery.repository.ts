import { PasswordRecovery } from '../domain/password-recovery.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PasswordRecoveryFromDB } from './dto/PasswordRecoveryFromDB';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPassRecovery(recoveryCode: string): Promise<PasswordRecovery | null> {
    const passwordRecoveryFromDB: PasswordRecoveryFromDB = (
      await this.dataSource.query(`SELECT * FROM public."PasswordRecovery" WHERE "recoveryCode" = $1;`, [recoveryCode])
    )[0];

    return PasswordRecovery.createPasswordRecovery(passwordRecoveryFromDB);
  }

  async savePassRecovery(passRecovery: PasswordRecovery) {
    await this.dataSource.query(
      `INSERT INTO public."PasswordRecovery" ("recoveryCode", "expirationDate", "email") VALUES ($1, $2, $3);`,
      [passRecovery.recoveryCode, passRecovery.expirationDate, passRecovery.email],
    );
  }

  async deletePassRecovery(recoveryCode: string) {
    await this.dataSource.query(`DELETE FROM public."PasswordRecovery" WHERE "recoveryCode" = $1;`, [recoveryCode]);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."PasswordRecovery";`);
  }
}

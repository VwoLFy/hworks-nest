import { add } from 'date-fns';
import { randomUUID } from 'crypto';
import { PasswordRecoveryFromDB } from '../infrastructure/dto/PasswordRecoveryFromDB';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PasswordRecovery')
export class PasswordRecovery {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  recoveryCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  email: string;

  constructor(email: string) {
    this.recoveryCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 24 });
    this.email = email;
  }

  static createPasswordRecovery(passwordRecoveryFromDB: PasswordRecoveryFromDB): PasswordRecovery {
    const passwordRecovery = new PasswordRecovery(passwordRecoveryFromDB.email);
    passwordRecovery.recoveryCode = passwordRecoveryFromDB.recoveryCode;
    passwordRecovery.expirationDate = passwordRecoveryFromDB.expirationDate;
    return passwordRecovery;
  }
}

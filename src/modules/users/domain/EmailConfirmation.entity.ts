import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { User } from './user.entity';

@Entity('EmailConfirmation')
export class EmailConfirmation {
  @Column()
  isConfirmed: boolean;
  @Column({ nullable: true })
  confirmationCode: string;
  @Column({ nullable: true })
  codeExpirationDate: Date;
  @OneToOne(() => User, (u) => u.emailConfirmation)
  @JoinColumn()
  owner: User;
  @PrimaryColumn('uuid')
  ownerId: string;

  constructor(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
    if (isConfirmed) {
      this.confirmationCode = null;
      this.codeExpirationDate = null;
    } else {
      this.confirmationCode = randomUUID();
      this.codeExpirationDate = add(new Date(), { hours: 1 });
    }
  }
}

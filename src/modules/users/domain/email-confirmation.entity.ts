import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { User } from './user.entity';

@Entity('UsersEmailConfirmation')
export class EmailConfirmation {
  @Column()
  isConfirmed: boolean;
  @Column({ nullable: true })
  confirmationCode: string;
  @Column({ nullable: true })
  codeExpirationDate: Date;
  @OneToOne(() => User, (u) => u.emailConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
  @PrimaryColumn('uuid')
  userId: string;

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

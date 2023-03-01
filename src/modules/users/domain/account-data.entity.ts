import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('UsersAccountData')
export class AccountData {
  @Column()
  login: string;
  @Column()
  passwordHash: string;
  @Column()
  email: string;
  @Column()
  createdAt: Date;
  @OneToOne(() => User, (u) => u.accountData)
  @JoinColumn()
  user: User;
  @PrimaryColumn('uuid')
  userId: string;

  constructor(login: string, passwordHash: string, email: string) {
    this.createdAt = new Date();
    this.login = login;
    this.passwordHash = passwordHash;
    this.email = email;
  }
}

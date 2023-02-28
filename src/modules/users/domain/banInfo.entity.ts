import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('BanInfo')
export class BanInfo {
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;
  @Column({ nullable: true })
  banReason: string;
  @OneToOne(() => User, (u) => u.banInfo)
  @JoinColumn()
  owner: User;
  @PrimaryColumn('uuid')
  ownerId: string;

  constructor() {
    this.isBanned = false;
    this.banDate = null;
    this.banReason = null;
  }
}

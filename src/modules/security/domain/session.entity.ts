import { SessionExtendedDto } from '../application/dto/SessionExtendedDto';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';

@Entity('Sessions')
export class Session {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column('uuid')
  userId: string;
  @Column()
  exp: number;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  iat: number;
  @Column()
  deviceId: string;
  @ManyToOne(() => User)
  user: User;

  constructor({ ...dto }: SessionExtendedDto) {
    this.userId = dto.userId;
    this.exp = dto.exp;
    this.ip = dto.ip;
    this.title = dto.title;
    this.iat = dto.iat;
    this.deviceId = dto.deviceId;
  }

  updateSessionData(dto: SessionExtendedDto) {
    this.ip = dto.ip;
    this.title = dto.title;
    this.exp = dto.exp;
    this.iat = dto.iat;
  }
}

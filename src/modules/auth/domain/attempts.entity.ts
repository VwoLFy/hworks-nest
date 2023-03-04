import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('AttemptsData')
export class AttemptsData {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column()
  date: Date;
  @Column()
  ip: string;
  @Column()
  url: string;

  constructor({ ...dto }: AttemptsDataDto) {
    this.date = new Date();
    this.ip = dto.ip;
    this.url = dto.url;
  }
}

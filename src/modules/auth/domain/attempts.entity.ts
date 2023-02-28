import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('AttemptsData')
export class AttemptsData {
  @Column()
  date: Date;
  @Column()
  ip: string;
  @Column()
  url: string;
  @PrimaryGeneratedColumn('increment')
  id: number;

  constructor({ ...dto }: AttemptsDataDto) {
    this.date = new Date();
    this.ip = dto.ip;
    this.url = dto.url;
  }
}

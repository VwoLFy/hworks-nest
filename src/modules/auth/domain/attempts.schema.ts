import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';

export class AttemptsData {
  date: Date;
  ip: string;
  url: string;

  constructor(dto: AttemptsDataDto) {
    this.date = new Date();
    this.ip = dto.ip;
    this.url = dto.url;
  }
}

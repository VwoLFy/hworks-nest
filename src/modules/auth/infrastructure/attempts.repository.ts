import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AttemptsData } from '../domain/attempts.schema';

@Injectable()
export class AttemptsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findAttempts(dto: AttemptsDataDto, fromDate: Date): Promise<number> {
    const { ip, url } = dto;

    const { count } = (
      await this.dataSource.query(
        `SELECT count(*) FROM public."AttemptsData" WHERE "ip" = $1 AND "url" = $2 AND "date" >= $3`,
        [ip, url, fromDate],
      )
    )[0];
    return count;
  }

  async saveAttempt(attempt: AttemptsData) {
    await this.dataSource.query(`INSERT INTO public."AttemptsData"("date", "ip", "url") VALUES ($1, $2, $3);`, [
      attempt.date,
      attempt.ip,
      attempt.url,
    ]);
  }

  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."AttemptsData";`);
  }
}

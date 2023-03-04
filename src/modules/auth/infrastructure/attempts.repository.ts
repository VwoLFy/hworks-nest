import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AttemptsData } from '../domain/attempts.entity';

@Injectable()
export class AttemptsRepository {
  constructor(@InjectRepository(AttemptsData) private readonly attemptsDataRepositoryT: Repository<AttemptsData>) {}
  async findAttempts(dto: AttemptsDataDto, fromDate: Date): Promise<number> {
    const { ip, url } = dto;

    return await this.attemptsDataRepositoryT.count({
      where: { ip: ip, url: url, date: MoreThanOrEqual(fromDate) },
    });
  }

  async saveAttempt(attempt: AttemptsData) {
    await this.attemptsDataRepositoryT.save(attempt);
  }

  async deleteAll() {
    await this.attemptsDataRepositoryT.clear();
  }
}

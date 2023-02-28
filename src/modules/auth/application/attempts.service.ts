import { AttemptsRepository } from '../infrastructure/attempts.repository';
import { add } from 'date-fns';
import { AttemptsDataDto } from './dto/AttemptsDataDto';
import { Injectable } from '@nestjs/common';
import { AttemptsData } from '../domain/attempts.entity';

@Injectable()
export class AttemptsService {
  constructor(protected attemptsRepository: AttemptsRepository) {}

  async countAttempts(dto: AttemptsDataDto, intervalInSeconds: number): Promise<number> {
    const attempt = new AttemptsData(dto);
    await this.attemptsRepository.saveAttempt(attempt);

    const fromDate = add(new Date(), { seconds: -intervalInSeconds });
    return this.attemptsRepository.findAttempts(dto, fromDate);
  }
}

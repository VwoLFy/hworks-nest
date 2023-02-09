import { AttemptsRepository } from '../infrastructure/attempts.repository';
import { add } from 'date-fns';
import { AttemptsDataDto } from './dto/AttemptsDataDto';
import { AttemptsData, AttemptsDataDocument } from '../domain/attempts.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AttemptsService {
  constructor(
    protected attemptsRepository: AttemptsRepository,
    @InjectModel(AttemptsData.name) private AttemptsDataModel: Model<AttemptsDataDocument>,
  ) {}

  async countAttempts(dto: AttemptsDataDto, intervalInSeconds: number): Promise<number> {
    const attempt = new AttemptsData(dto);
    const attemptModel = new this.AttemptsDataModel(attempt);
    await this.attemptsRepository.save(attemptModel);

    const fromDate = +add(new Date(), { seconds: -intervalInSeconds });
    return this.attemptsRepository.findAttempts(dto, fromDate);
  }
}

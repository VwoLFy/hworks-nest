import { AttemptsRepository } from '../infrastructure/attempts-repository';
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

  async findAttempts(dto: AttemptsDataDto): Promise<number> {
    const fromDate = +add(new Date(), { seconds: -10 });
    return this.attemptsRepository.findAttempts(dto, fromDate);
  }

  async addAttemptToList(dto: AttemptsDataDto): Promise<void> {
    const attempt = new this.AttemptsDataModel(dto);
    await this.attemptsRepository.save(attempt);
  }

  async deleteAll() {
    await this.attemptsRepository.deleteAll();
  }
}

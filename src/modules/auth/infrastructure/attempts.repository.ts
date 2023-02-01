import { AttemptsData, AttemptsDataDocument } from '../domain/attempts.schema';
import { AttemptsDataDto } from '../application/dto/AttemptsDataDto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AttemptsRepository {
  constructor(@InjectModel(AttemptsData.name) private AttemptsDataModel: Model<AttemptsDataDocument>) {}
  async findAttempts(dto: AttemptsDataDto, fromDate: number): Promise<number> {
    const { ip, url } = dto;

    const query = this.AttemptsDataModel.countDocuments()
      .where('ip')
      .equals(ip)
      .where('url')
      .equals(url)
      .where('date')
      .gte(fromDate);
    return query.exec();
  }

  async save(attempt: AttemptsDataDocument) {
    await attempt.save();
  }

  async deleteAll() {
    await this.AttemptsDataModel.deleteMany();
  }
}

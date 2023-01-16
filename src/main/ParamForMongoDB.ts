import { HttpException, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { HTTP_Status } from './types/enums';

export class ParamForMongoDB implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!ObjectId.isValid(value)) {
      throw new HttpException('id isn`t valid', HTTP_Status.NOT_FOUND_404);
    }
    return value;
  }
}
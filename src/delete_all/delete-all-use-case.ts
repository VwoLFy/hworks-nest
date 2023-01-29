import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DeleteAllUseCase {
  constructor(@InjectConnection() private connection: Connection) {}
  async execute() {
    await this.connection.dropDatabase();
  }
}

import { Module } from '@nestjs/common';
import { DeleteAllController } from './delete-all.controller';
import { DeleteAllUseCase } from './delete-all-use-case';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  controllers: [DeleteAllController],
  providers: [DeleteAllUseCase],
})
export class DeleteAllModule {}

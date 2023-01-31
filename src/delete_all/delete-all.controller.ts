import { Controller, Delete, HttpCode } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllCommand } from './delete-all-use-case';

@Controller('/testing/all-data')
export class DeleteAllController {
  constructor(private commandBus: CommandBus) {}

  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.commandBus.execute(new DeleteAllCommand());
  }
}

import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DeleteAllUseCase } from './delete-all-use-case';

@Controller('/testing/all-data')
export class DeleteAllController {
  constructor(private deleteAllUseCase: DeleteAllUseCase) {}

  @Delete()
  @HttpCode(204)
  async deleteAll() {
    await this.deleteAllUseCase.execute();
  }
}

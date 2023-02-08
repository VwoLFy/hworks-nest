import { SecurityRepository } from '../../infrastructure/security.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteSessionsExceptCurrentCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(DeleteSessionsExceptCurrentCommand)
export class DeleteSessionsExceptCurrentUseCase implements ICommandHandler<DeleteSessionsExceptCurrentCommand> {
  constructor(protected securityRepository: SecurityRepository) {}

  async execute(command: DeleteSessionsExceptCurrentCommand) {
    await this.securityRepository.DeleteSessionsExceptCurrent(command.userId, command.deviceId);
  }
}

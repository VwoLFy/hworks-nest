import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SecurityRepository } from '../../infrastructure/security.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteSessionCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase implements ICommandHandler<DeleteSessionCommand> {
  constructor(protected securityRepository: SecurityRepository) {}

  async execute(command: DeleteSessionCommand) {
    const { userId, deviceId } = command;

    const foundSession = await this.securityRepository.findSessionByDeviceId(deviceId);
    if (!foundSession) throw new NotFoundException();
    if (foundSession.userId !== userId) throw new ForbiddenException();

    await this.securityRepository.deleteSessionByDeviceId(deviceId);
  }
}

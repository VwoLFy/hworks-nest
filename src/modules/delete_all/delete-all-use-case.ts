import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { SecurityRepository } from '../security/infrastructure/security.repository';
import { AttemptsRepository } from '../auth/infrastructure/attempts.repository';
import { PasswordRecoveryRepository } from '../auth/infrastructure/password-recovery.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllUseCase implements ICommandHandler<DeleteAllCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    private securityRepository: SecurityRepository,
    private attemptsRepository: AttemptsRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
  ) {}
  async execute() {
    await this.attemptsRepository.deleteAll();
    await this.passwordRecoveryRepository.deleteAll();
    await this.securityRepository.deleteAll();
    await this.commentsRepository.deleteAll();
    await this.postsRepository.deleteAll();
    await this.usersRepository.deleteAllBannedUsersForBlogs();
    await this.blogsRepository.deleteAll();
    await this.usersRepository.deleteAllUsers();
  }
}

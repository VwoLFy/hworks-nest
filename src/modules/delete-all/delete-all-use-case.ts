// import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
// import { PostsRepository } from '../posts/infrastructure/posts.repository';
// import { UsersRepository } from '../users/infrastructure/users.repository';
// import { CommentsRepository } from '../comments/infrastructure/comments.repository';
// import { SecurityRepository } from '../security/infrastructure/security.repository';
// import { AttemptsRepository } from '../auth/infrastructure/attempts.repository';
// import { PasswordRecoveryRepository } from '../auth/infrastructure/password-recovery.repository';
// import { BloggerUsersRepository } from '../blogger.users/infrastructure/blogger.users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DeleteAllCommand {}

@CommandHandler(DeleteAllCommand)
export class DeleteAllUseCase implements ICommandHandler<DeleteAllCommand> {
  constructor(
    // private postsRepository: PostsRepository,
    // private blogsRepository: BlogsRepository,
    // private usersRepository: UsersRepository,
    // private bannedUsersForBlogRepository: BloggerUsersRepository,
    // private commentsRepository: CommentsRepository,
    // private securityRepository: SecurityRepository,
    // private attemptsRepository: AttemptsRepository,
    // private passwordRecoveryRepository: PasswordRecoveryRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async execute() {
    const connection = this.dataSource;
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
      const repository = connection.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }

    // await this.attemptsRepository.deleteAll();
    // await this.passwordRecoveryRepository.deleteAll();
    // await this.securityRepository.deleteAll();
    // await this.commentsRepository.deleteAll();
    // await this.postsRepository.deleteAll();
    // await this.bannedUsersForBlogRepository.deleteAllBannedUsersForBlogs();
    // await this.blogsRepository.deleteAll();
    // await this.usersRepository.deleteAllUsers();
  }
}

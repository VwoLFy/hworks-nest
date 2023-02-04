import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BadRequestException } from '@nestjs/common';

export class BindBlogWithUserCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected usersRepository: UsersRepository) {}
  async execute(command: BindBlogWithUserCommand) {
    const { userId, blogId } = command;

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog || foundBlog.blogOwnerInfo.userId)
      throw new BadRequestException([{ message: `blogId isn't correct`, field: 'blogId' }]);

    const foundUser = await this.usersRepository.findUserById(userId);
    if (!foundUser) throw new BadRequestException([{ message: `user isn't find`, field: 'userId' }]);

    foundBlog.blogOwnerInfo.userId = userId;
    foundBlog.blogOwnerInfo.userLogin = foundUser.accountData.login;

    await this.blogsRepository.saveBlog(foundBlog);
  }
}

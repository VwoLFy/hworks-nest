import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class BindBlogWithUserCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(protected blogsRepository: BlogsRepository, protected usersRepository: UsersRepository) {}

  async execute(command: BindBlogWithUserCommand) {
    const { userId, blogId } = command;

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException([{ message: `blog not found`, field: 'blogId' }]);
    if (foundBlog.userId)
      throw new BadRequestException([{ message: `blog already bound to any user`, field: 'blogId' }]);

    const foundUser = await this.usersRepository.findUserById(userId);
    if (!foundUser) throw new NotFoundException([{ message: `user not found`, field: 'userId' }]);

    foundBlog.bindBlogWithUser(userId, foundUser.accountData.login);

    await this.blogsRepository.updateBlogOwner(foundBlog);
  }
}

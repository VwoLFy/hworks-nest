import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/UpdateBlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(public userId: string, public blogId: string, public dto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogId, userId, dto } = command;

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    blog.updateBlog(dto);
    await this.blogsRepository.updateBlog(blog);
    return true;
  }
}

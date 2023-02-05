import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: DeleteBlogCommand) {
    const { userId, blogId } = command;

    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('blog not found');
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    await this.blogsRepository.deleteBlog(blogId);
    await this.postsRepository.deleteAllPostsOfBlog(blogId);
  }
}

import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Blog, BlogDocument } from '../../domain/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public _id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const isDeletedBlog = await this.blogsRepository.deleteBlog(command._id);
    if (!isDeletedBlog) return false;

    await this.postsRepository.deleteAllPostsOfBlog(command._id);
    return true;
  }
}

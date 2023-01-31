import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post, PostDocument } from '../../domain/post.schema';
import { CreatePostDto } from '../dto/CreatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostCommand): Promise<string | null> {
    const foundBlogName = await this.blogsRepository.findBlogNameById(command.dto.blogId);
    if (!foundBlogName) return null;

    const post = new this.PostModel({ ...command.dto, blogName: foundBlogName });
    await this.postsRepository.savePost(post);
    return post.id;
  }
}

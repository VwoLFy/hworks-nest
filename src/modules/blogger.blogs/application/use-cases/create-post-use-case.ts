import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Post } from '../../../posts/domain/post.entity';
import { CreatePostDto } from '../dto/CreatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerBlogsService } from '../blogger.blogs.service';

export class CreatePostCommand {
  constructor(public userId: string, public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected bloggerBlogsService: BloggerBlogsService) {}

  async execute(command: CreatePostCommand): Promise<string> {
    return await this.createPostDocument(command);
  }

  async createPostDocument(command: CreatePostCommand): Promise<string> {
    const { userId, dto } = command;
    const foundBlog = await this.bloggerBlogsService.findOwnBlogById(userId, dto.blogId);

    const post = new Post(dto, foundBlog.name);
    await this.postsRepository.savePost(post);

    return post.id;
  }
}

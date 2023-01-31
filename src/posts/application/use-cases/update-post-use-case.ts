import { UpdatePostDto } from '../dto/UpdatePostDto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(public _id: string, public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { _id, dto } = command;

    const foundBlogName = await this.blogsRepository.findBlogNameById(dto.blogId);
    if (!foundBlogName) return false;

    const post = await this.postsRepository.findPostById(_id);
    if (!post) return false;

    post.updatePost(dto, foundBlogName);
    await this.postsRepository.savePost(post);
    return true;
  }
}

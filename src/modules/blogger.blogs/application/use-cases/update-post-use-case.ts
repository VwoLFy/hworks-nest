import { UpdatePostDto } from '../../../posts/application/dto/UpdatePostDto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BloggerBlogsService } from '../blogger.blogs.service';

export class UpdatePostCommand {
  constructor(public userId: string, public postId: string, public blogId: string, public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected bloggerBlogsService: BloggerBlogsService) {}

  async execute(command: UpdatePostCommand) {
    const { userId, postId, blogId, dto } = command;

    await this.bloggerBlogsService.findOwnBlogById(userId, blogId);

    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException('post not found');

    post.updatePost(dto);
    await this.postsRepository.savePost(post);
  }
}

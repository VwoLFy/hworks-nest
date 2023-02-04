import { UpdatePostDto } from '../dto/UpdatePostDto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(public userId: string, public postId: string, public blogId: string, public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}

  async execute(command: UpdatePostCommand) {
    const { userId, postId, blogId, dto } = command;

    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new NotFoundException('post not found');

    const foundBlog = await this.blogsRepository.findBlogById(blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (foundBlog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    post.updatePost(dto);
    await this.postsRepository.savePost(post);
  }
}

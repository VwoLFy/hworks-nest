import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { Comment } from '../../../comments/domain/comment.entity';
import { CreateCommentDto } from '../dto/CreateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerUsersRepository } from '../../../blogger.users/infrastructure/blogger.users.repository';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected bloggerUsersRepository: BloggerUsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { postId, userId } = command.dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) throw new NotFoundException('post not found');

    const isBannedForBlog = await this.bloggerUsersRepository.findBannedUserForBlog(foundPost.blogId, userId);
    if (isBannedForBlog) throw new ForbiddenException();

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    const comment = new Comment({ ...command.dto, userLogin });
    await this.commentsRepository.saveComment(comment);

    return comment.id;
  }
}

import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment } from '../../domain/comment.schema';
import { CreateCommentDto } from '../dto/CreateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { postId, userId } = command.dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) throw new NotFoundException('post not found');

    const isBannedForBlog = await this.usersRepository.findBannedUserForBlog(foundPost.blogId, userId);
    if (isBannedForBlog) throw new ForbiddenException();

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    const comment = new Comment(command.dto, userLogin);
    await this.commentsRepository.saveComment(comment);

    return comment.id;
  }
}

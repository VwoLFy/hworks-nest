import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment, CommentDocument } from '../../domain/comment.schema';
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
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const comment = await this.createCommentDocument(command.dto);
    return comment.id;
  }

  async createCommentDocument(dto: CreateCommentDto): Promise<CommentDocument> {
    const { postId, userId } = dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) throw new NotFoundException('post not found');

    const isBannedForBlog = await this.usersRepository.findBannedUserForBlog(foundPost.blogId, userId);
    if (isBannedForBlog) throw new ForbiddenException();

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    const comment = new Comment(dto, userLogin);
    const commentModel = new this.CommentModel(comment);
    await this.commentsRepository.saveComment(commentModel);

    return commentModel;
  }
}

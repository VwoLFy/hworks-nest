import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment, CommentatorInfo, CommentDocument } from '../../domain/comment.schema';
import { CreateCommentDto } from '../dto/CreateCommentDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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

  async execute(command: CreateCommentCommand): Promise<string | null> {
    const { postId, userId, content } = command.dto;

    const isPostExist = await this.postsRepository.findPostById(postId);
    const userLogin = await this.usersRepository.findUserLoginById(userId);
    if (!isPostExist || !userLogin) return null;

    const commentatorInfo = new CommentatorInfo(userId, userLogin);
    const comment = new this.CommentModel({ content, commentatorInfo, postId });

    await this.commentsRepository.saveComment(comment);
    return comment.id;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment, CommentatorInfo, CommentDocument } from '../../domain/comment.schema';
import { CreateCommentDto } from '../dto/CreateCommentDto';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
  ) {}

  async execute(dto: CreateCommentDto): Promise<string | null> {
    const isPostExist = await this.postsRepository.findPostById(dto.postId);
    const userLogin = await this.usersRepository.findUserLoginById(dto.userId);
    if (!isPostExist || !userLogin) return null;

    const commentatorInfo = new CommentatorInfo(dto.userId, userLogin);
    const comment = new this.CommentModel({ ...dto, commentatorInfo });

    await this.commentsRepository.saveComment(comment);
    return comment.id;
  }
}

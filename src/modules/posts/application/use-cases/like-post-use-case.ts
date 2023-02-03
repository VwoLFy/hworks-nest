import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikePostDto } from '../dto/LikePostDto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../../domain/postLike.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LikePostCommand {
  constructor(public dto: LikePostDto) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async execute(command: LikePostCommand): Promise<boolean> {
    const { postId, userId, likeStatus } = command.dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) return false;

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);
    const foundLike = await this.postsRepository.findPostLike(postId, userId);

    const like = foundPost.setLikeStatus(foundLike, userId, userLogin, likeStatus, this.PostLikeModel);
    await this.postsRepository.savePost(foundPost);
    await this.postsRepository.savePostLike(like);

    return true;
  }
}

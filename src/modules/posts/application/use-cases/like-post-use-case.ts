import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikePostDto } from '../dto/LikePostDto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../../domain/postLike.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostDocument } from '../../domain/post.schema';

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

  async execute(command: LikePostCommand) {
    const foundPost = await this.postsRepository.findPostById(command.dto.postId);
    if (!foundPost) throw new NotFoundException('post not found');

    await this.setLikeStatus(command.dto, foundPost);
  }

  async setLikeStatus(dto: LikePostDto, foundPost: PostDocument) {
    const { postId, userId, likeStatus } = dto;

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);
    const oldLike = await this.postsRepository.findPostLike(postId, userId);

    const newLike = foundPost.setLikeStatus(this.PostLikeModel, oldLike, userId, userLogin, likeStatus);

    await this.postsRepository.savePost(foundPost);
    await this.postsRepository.savePostLike(newLike);
  }
}

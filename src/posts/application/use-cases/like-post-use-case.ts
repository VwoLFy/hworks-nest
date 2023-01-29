import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikePostDto } from '../dto/LikePostDto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../../domain/postLike.schema';

@Injectable()
export class LikePostUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async execute(dto: LikePostDto): Promise<boolean> {
    const { postId, userId, likeStatus } = dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) return false;

    const userLogin = await this.usersRepository.findUserLoginById(userId);
    if (!userLogin) return false;

    const foundLike = await this.postsRepository.findPostLike(postId, userId);

    const like = foundPost.setLikeStatus(foundLike, userId, userLogin, likeStatus, this.PostLikeModel);
    await this.postsRepository.savePost(foundPost);
    await this.postsRepository.savePostLike(like);

    return true;
  }
}

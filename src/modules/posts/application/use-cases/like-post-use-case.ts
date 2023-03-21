import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikePostDto } from '../dto/LikePostDto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class LikePostCommand {
  constructor(public dto: LikePostDto) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(protected postsRepository: PostsRepository, protected usersRepository: UsersRepository) {}

  async execute(command: LikePostCommand) {
    const { postId, userId, likeStatus } = command.dto;

    const foundPostWithLike = await this.postsRepository.findPostWithLikeOfUser(postId, userId);
    if (!foundPostWithLike) throw new NotFoundException('post not found');

    const userLogin = await this.usersRepository.findUserLoginByIdOrThrowError(userId);

    foundPostWithLike.setLikeStatus(userId, userLogin, likeStatus);
    await this.postsRepository.savePost(foundPostWithLike);
  }
}

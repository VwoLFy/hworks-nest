import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post, PostDocument } from '../../domain/post.schema';
import { CreatePostDto } from '../dto/CreatePostDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class CreatePostCommand {
  constructor(public userId: string, public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const post = await this.createPostDocument(command);
    return post.id;
  }

  async createPostDocument(command: CreatePostCommand): Promise<PostDocument> {
    const { userId, dto } = command;

    const foundBlog = await this.blogsRepository.findBlogById(dto.blogId);
    if (!foundBlog) throw new NotFoundException('blog not found');
    if (foundBlog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();

    const post = new Post(dto, foundBlog.name);
    const postModel = new this.PostModel(post);
    await this.postsRepository.savePost(postModel);

    return postModel;
  }
}

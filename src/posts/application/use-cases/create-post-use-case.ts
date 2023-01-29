import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post, PostDocument } from '../../domain/post.schema';
import { CreatePostDto } from '../dto/CreatePostDto';

@Injectable()
export class CreatePostUseCase {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
  ) {}

  async execute(dto: CreatePostDto): Promise<string | null> {
    const foundBlogName = await this.blogsRepository.findBlogNameById(dto.blogId);
    if (!foundBlogName) return null;

    const post = new this.PostModel({ ...dto, blogName: foundBlogName });
    await this.postsRepository.savePost(post);
    return post.id;
  }
}

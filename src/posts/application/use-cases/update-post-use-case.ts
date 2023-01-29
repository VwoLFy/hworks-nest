import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/UpdatePostDto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

@Injectable()
export class UpdatePostUseCase {
  constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}

  async execute(_id: string, dto: UpdatePostDto): Promise<boolean> {
    const foundBlogName = await this.blogsRepository.findBlogNameById(dto.blogId);
    if (!foundBlogName) return false;

    const post = await this.postsRepository.findPostById(_id);
    if (!post) return false;

    post.updatePost(dto, foundBlogName);
    await this.postsRepository.savePost(post);
    return true;
  }
}

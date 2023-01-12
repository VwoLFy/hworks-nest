import { PostsRepository } from '../infrastructure/posts-repository';
import { UpdatePostDto } from './dto/UpdatePostDto';
import { Post, PostDocument } from '../domain/post.schema';
import { CommentsRepository } from '../../comments/infrastructure/comments-repository';
import { CreatePostDto } from './dto/CreatePostDto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs-repository';
import { LikePostDto } from './dto/LikePostDto';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../domain/postLike.schema';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string | null> {
    const foundBlogName = await this.blogsRepository.findBlogNameById(
      dto.blogId,
    );
    if (!foundBlogName) return null;

    const post = new this.PostModel({ ...dto, blogName: foundBlogName });
    await this.postsRepository.savePost(post);
    return post.id;
  }
  async updatePost(_id: string, dto: UpdatePostDto): Promise<boolean> {
    const foundBlogName = await this.blogsRepository.findBlogNameById(
      dto.blogId,
    );
    if (!foundBlogName) return false;

    const post = await this.postsRepository.findPostById(_id);
    if (!post) return false;

    post.updatePost(dto, foundBlogName);
    await this.postsRepository.savePost(post);
    return true;
  }
  async likePost(dto: LikePostDto): Promise<boolean> {
    const { postId, userId, likeStatus } = dto;

    const foundPost = await this.postsRepository.findPostById(postId);
    if (!foundPost) return false;

    const userLogin = await this.usersRepository.findUserLoginById(userId);
    if (!userLogin) return false;

    const foundLike = await this.postsRepository.findPostLike(postId, userId);

    const like = foundPost.setLikeStatus(
      foundLike,
      userId,
      userLogin,
      likeStatus,
      this.PostLikeModel,
    );
    await this.postsRepository.savePost(foundPost);
    await this.postsRepository.savePostLike(like);

    return true;
  }
  async deletePost(_id: string): Promise<boolean> {
    const isDeletedPost = await this.postsRepository.deletePost(_id);
    if (!isDeletedPost) return false;

    await this.commentsRepository.deleteAllCommentsOfPost(_id);
    return true;
  }
  async deleteAll() {
    await this.postsRepository.deleteAll();
  }
}

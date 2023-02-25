import { Post } from '../../../posts/domain/post.schema';

export class PostInfoViewModel {
  id: string;
  title: string;
  blogId: string;
  blogName: string;

  constructor(post: Post) {
    this.id = post.id;
    this.title = post.title;
    this.blogId = post.blogId;
    this.blogName = post.blogName;
  }
}

import { PostDocument } from '../../../posts/domain/post.schema';

export class PostInfoViewModel {
  id: string;
  title: string;
  blogId: string;
  blogName: string;

  constructor(post: PostDocument) {
    this.id = post._id.toString();
    this.title = post.title;
    this.blogId = post.blogId;
    this.blogName = post.blogName;
  }
}

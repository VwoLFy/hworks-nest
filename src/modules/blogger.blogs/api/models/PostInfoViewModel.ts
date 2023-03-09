import { PostFromDB } from '../../../posts/infrastructure/types/PostFromDB';

export class PostInfoViewModel {
  id: string;
  title: string;
  blogId: string;
  blogName: string;

  constructor(postFromDB: PostFromDB) {
    this.id = postFromDB.id;
    this.title = postFromDB.title;
    this.blogId = postFromDB.blogId;
    this.blogName = postFromDB.blogName;
  }
}

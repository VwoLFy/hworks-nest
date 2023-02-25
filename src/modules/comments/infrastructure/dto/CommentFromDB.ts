export class CommentFromDB {
  id: string;
  content: string;
  postId: string;
  createdAt: Date;
  isBanned: boolean;
  userId: string;
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
}

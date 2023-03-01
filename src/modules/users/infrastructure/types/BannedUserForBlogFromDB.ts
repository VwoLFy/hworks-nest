export class BannedUserForBlogFromDB {
  id: number;
  userId: string;
  userLogin: string;
  banReason: string;
  banDate: Date;
  blogId: string;
}

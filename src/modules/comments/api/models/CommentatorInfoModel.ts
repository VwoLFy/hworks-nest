export class CommentatorInfoModel {
  userId: string;
  userLogin: string;

  constructor(userId: string, userLogin: string) {
    this.userId = userId;
    this.userLogin = userLogin;
  }
}

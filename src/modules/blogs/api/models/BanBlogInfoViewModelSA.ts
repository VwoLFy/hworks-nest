export class BanBlogInfoViewModelSA {
  isBanned: boolean;
  banDate: string;

  constructor(isBanned: boolean, banDate: Date) {
    this.isBanned = isBanned;
    this.banDate = banDate ? banDate.toISOString() : null;
  }
}

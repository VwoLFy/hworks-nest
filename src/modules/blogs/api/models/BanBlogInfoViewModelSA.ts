import { BanBlogInfo } from '../../domain/blog.schema';

export class BanBlogInfoViewModelSA {
  isBanned: boolean;
  banDate: string;

  constructor(banBlogInfo: BanBlogInfo) {
    this.isBanned = banBlogInfo.isBanned;
    this.banDate = banBlogInfo.banDate ? banBlogInfo.banDate.toISOString() : null;
  }
}

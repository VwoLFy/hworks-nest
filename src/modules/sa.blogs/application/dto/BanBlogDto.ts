import { IsBoolean } from 'class-validator';

export class BanBlogDto {
  @IsBoolean()
  isBanned: boolean;
}

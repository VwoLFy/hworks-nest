import { Transform } from 'class-transformer';
import { IsBoolean, IsString, IsUUID, Length, ValidateIf } from 'class-validator';
import { IsBlogExist } from '../../../../main/decorators/is-blog-exist.decorator';

export class BanUserForBlogDto {
  @IsBoolean()
  isBanned: boolean;

  @ValidateIf((object) => object.isBanned === true)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(20)
  @IsString()
  banReason: string;

  @IsBlogExist()
  @IsUUID()
  blogId: string;
}

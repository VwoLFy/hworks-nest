import { Transform } from 'class-transformer';
import { IsString, IsUrl, Length } from 'class-validator';

//BlogUpdateModel
export class UpdateBlogDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 15)
  @IsString()
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 500)
  @IsString()
  description: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 100)
  @IsUrl()
  websiteUrl: string;
}

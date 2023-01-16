import { IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

//BlogInputModel
export class CreateBlogDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 15)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 500)
  description: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}

import { IsMongoId, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBlogExist } from '../../../../main/decorators/is-blog-exist.decorator';

//PostInputModel
export class CreatePostDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 30)
  @IsString()
  title: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 100)
  @IsString()
  shortDescription: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(1, 1000)
  @IsString()
  content: string;

  @IsBlogExist()
  @IsMongoId()
  blogId: string;
}

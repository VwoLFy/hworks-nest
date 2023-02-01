import { Transform } from 'class-transformer';
import { IsMongoId, IsString, Length } from 'class-validator';
import { IsBlogExist } from '../../../../main/decorators/is-blog-exist.decorator';

//PostUpdateModel
export class UpdatePostDto {
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

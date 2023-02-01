import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class BlogPostInputModel {
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
}

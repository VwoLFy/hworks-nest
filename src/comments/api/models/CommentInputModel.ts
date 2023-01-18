import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CommentInputModel {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(20, 300)
  @IsString()
  content: string;
}

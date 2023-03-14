import { ArrayNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionDto {
  @Transform((params) => (typeof params.value == 'string' ? params.value.trim() : params.value))
  @MaxLength(500)
  @MinLength(10)
  @IsString()
  body: string;

  @Transform((params) =>
    Array.isArray(params.value) ? params.value.map((v) => (typeof v === 'string' ? v.trim() : v)) : params.value,
  )
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @ArrayNotEmpty()
  correctAnswers: string[];
}

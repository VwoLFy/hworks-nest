import { IsOptional } from 'class-validator';

export class AnswerInputDto {
  @IsOptional()
  answer: string;
}

//NewPasswordRecoveryInputModel
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class NewPasswordRecoveryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(6, 20)
  @IsString()
  newPassword: string;

  @IsString()
  recoveryCode: string;
}

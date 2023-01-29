import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { IsEmailValidForConfirm } from '../../../main/decorators/is-email-valid-for-confirm-decorator';

export class RegistrationEmailResendingModel {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmailValidForConfirm()
  @IsEmail()
  email: string;
}

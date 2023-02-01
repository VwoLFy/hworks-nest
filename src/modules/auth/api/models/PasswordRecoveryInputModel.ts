import { IsEmail } from 'class-validator';

export class PasswordRecoveryInputModel {
  @IsEmail()
  email: string;
}

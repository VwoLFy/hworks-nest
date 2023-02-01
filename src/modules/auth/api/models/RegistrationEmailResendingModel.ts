import { IsEmail } from 'class-validator';

export class RegistrationEmailResendingModel {
  @IsEmail()
  email: string;
}

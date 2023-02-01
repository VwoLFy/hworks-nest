import { IsString } from 'class-validator';

export class RegistrationConfirmationCodeModel {
  @IsString()
  code: string;
}

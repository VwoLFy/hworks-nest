import { IsConfirmCodeValid } from '../../../main/Decorators/IsConfirmCodeValidDecorator';

export class RegistrationConfirmationCodeModel {
  @IsConfirmCodeValid()
  code: string;
}

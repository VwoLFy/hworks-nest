import { IsConfirmCodeValid } from '../../../main/decorators/IsConfirmCodeValidDecorator';

export class RegistrationConfirmationCodeModel {
  @IsConfirmCodeValid()
  code: string;
}

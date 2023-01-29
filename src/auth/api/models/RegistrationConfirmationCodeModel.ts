import { IsConfirmCodeValid } from '../../../main/decorators/is-confirm-code-valid-decorator';

export class RegistrationConfirmationCodeModel {
  @IsConfirmCodeValid()
  code: string;
}

//LoginInputModel
import { IsString, Length } from 'class-validator';

export class CredentialsDto {
  @Length(3)
  @IsString()
  loginOrEmail: string;

  @Length(6, 20)
  @IsString()
  password: string;
}

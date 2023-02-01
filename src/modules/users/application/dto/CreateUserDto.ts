import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { IsFreeLoginOrEmail } from '../../../../main/decorators/is-free-login-or-email.decorator';

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsFreeLoginOrEmail()
  @Length(3, 10)
  @Matches('^[a-zA-Z0-9_-]*$')
  @IsString()
  login: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(6, 20)
  @IsString()
  password: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsFreeLoginOrEmail()
  @IsEmail()
  email: string;
}

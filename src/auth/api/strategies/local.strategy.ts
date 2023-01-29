import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CheckCredentialsOfUserUseCase } from '../../application/use-cases/check-credentials-of-user-use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly checkCredentialsOfUserUseCase: CheckCredentialsOfUserUseCase) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<{ userId: string }> {
    const userId = await this.checkCredentialsOfUserUseCase.execute({ loginOrEmail, password });
    if (!userId) throw new UnauthorizedException();

    return { userId };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { ApiConfigService } from '../../../../main/configuration/api.config.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private apiConfigService: ApiConfigService) {
    super();
  }

  async validate(username: string, password: string) {
    if (username !== this.apiConfigService.SA_LOGIN || password !== this.apiConfigService.SA_PASSWORD)
      throw new UnauthorizedException();
    return true;
  }
}

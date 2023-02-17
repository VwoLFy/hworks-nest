import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvType } from './configuration';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService<EnvType>) {}

  get PORT(): number {
    return +this.configService.get('PORT', { infer: true }) || 5005;
  }

  get MONGO_URI(): string {
    const node_env = this.configService.get('NODE_ENV', { infer: true });
    const mongo_uri = this.configService.get('MONGO_URI', { infer: true });
    return node_env === 'development' || node_env === 'test' ? 'mongodb://0.0.0.0:27017/' : mongo_uri;
  }

  get JWT_SECRET_FOR_ACCESSTOKEN(): string {
    return this.configService.get('JWT_SECRET_FOR_ACCESSTOKEN', { infer: true });
  }

  get EXPIRES_IN_TIME_OF_ACCESSTOKEN(): string {
    return this.configService.get('EXPIRES_IN_TIME_OF_ACCESSTOKEN', { infer: true });
  }

  get JWT_SECRET_FOR_REFRESHTOKEN(): string {
    return this.configService.get('JWT_SECRET_FOR_REFRESHTOKEN', { infer: true });
  }

  get EXPIRES_IN_TIME_OF_REFRESHTOKEN(): string {
    return this.configService.get('EXPIRES_IN_TIME_OF_REFRESHTOKEN', { infer: true });
  }

  get SA_LOGIN(): string {
    return this.configService.get('SA_LOGIN', { infer: true });
  }

  get SA_PASSWORD(): string {
    return this.configService.get('SA_PASSWORD', { infer: true });
  }

  get NODE_ENV(): string {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get EMAIL(): string {
    return this.configService.get('EMAIL', { infer: true });
  }

  get EMAIL_PASSWORD(): string {
    return this.configService.get('EMAIL_PASSWORD', { infer: true });
  }

  get MY_EMAIL(): string {
    return this.configService.get('MY_EMAIL', { infer: true });
  }

  get EMAIL_FROM(): string {
    return this.configService.get('EMAIL_FROM', { infer: true });
  }

  get IP_RESTRICTION(): boolean {
    return this.configService.get('IP_RESTRICTION') !== false;
  }
}

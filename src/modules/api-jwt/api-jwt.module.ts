import { Module } from '@nestjs/common';
import { ApiJwtService } from './api-jwt.service';
import { ApiConfigModule } from '../../main/configuration/api.config.module';
import { JwtModule } from '@nestjs/jwt';
import { ApiConfigService } from '../../main/configuration/api.config.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (apiConfigService: ApiConfigService) => {
        return {
          secret: apiConfigService.JWT_SECRET_FOR_ACCESSTOKEN,
          signOptions: { expiresIn: apiConfigService.EXPIRES_IN_TIME_OF_ACCESSTOKEN },
        };
      },
    }),
    ApiConfigModule,
  ],
  providers: [ApiJwtService],
  exports: [ApiJwtService],
})
export class ApiJwtModule {}

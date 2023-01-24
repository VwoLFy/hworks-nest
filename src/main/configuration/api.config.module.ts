import { Module } from '@nestjs/common';
import { ApiConfigService } from './api.config.service';

@Module({
  imports: [],
  providers: [ApiConfigService],
  exports: [ApiConfigService],
})
export class ApiConfigModule {}

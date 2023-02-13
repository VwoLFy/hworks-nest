import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiConfigService } from './main/configuration/api.config.service';
import { appConfig } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appConfig(app);

  const apiConfigService = app.get(ApiConfigService);
  const port = apiConfigService.PORT;

  await app.listen(port, () => {
    console.log(`Server listening ${port}`);
  });
}
bootstrap();

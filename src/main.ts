import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { ApiConfigService } from './main/configuration/api.config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const err = [];
        errors.forEach((e) => {
          for (const eKey in e.constraints) {
            err.push({
              field: e.property,
              message: e.constraints[eKey],
            });
          }
        });
        throw new BadRequestException(err);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const apiConfigService = app.get(ApiConfigService);
  const port = apiConfigService.PORT;

  await app.listen(port, () => {
    console.log(`Server listening ${port}`);
  });
}
bootstrap();

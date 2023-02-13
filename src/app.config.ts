import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';

export const appConfig = (app: INestApplication) => {
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
};

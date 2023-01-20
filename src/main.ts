import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception.filter';
import { HTTP_Status } from './main/types/enums';
import cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
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
        throw new HttpException(err, HTTP_Status.BAD_REQUEST_400);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(PORT, () => {
    console.log(`Server listening ${PORT}`);
  });
}
bootstrap();

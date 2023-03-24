import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailAdapter } from '../../src/modules/auth/infrastructure/email.adapter';
import { appConfig } from '../../src/app.config';

export async function testCreateApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailAdapter)
    .useValue({ sendEmail: () => 'OK' })
    .compile();

  const app = moduleFixture.createNestApplication();
  appConfig(app);
  await app.init();

  return app;
}

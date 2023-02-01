import { EmailAdapter } from '../infrastructure/email.adapter';
import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../../../main/configuration/api.config.service';

@Injectable()
export class EmailService {
  constructor(protected emailAdapter: EmailAdapter, private apiConfigService: ApiConfigService) {}

  async sendEmailConfirmationMessage(email: string, code: string) {
    const subject = `Confirmation Message from ${this.apiConfigService.EMAIL_FROM}`;
    const template = 'confirmation';
    await this.emailAdapter.sendEmail({ email, subject, code, template });
  }
  async sendEmailPasswordRecoveryMessage(email: string, code: string) {
    const subject = `Password Recovery Message from ${this.apiConfigService.EMAIL_FROM}`;
    const template = 'passwordRecovery';
    await this.emailAdapter.sendEmail({ email, subject, code, template });
  }
}

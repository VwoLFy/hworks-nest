import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ApiConfigService } from '../../../main/configuration/api.config.service';

type EmailSendDto = {
  email: string;
  subject: string;
  code: string;
  template: string;
};

@Injectable()
export class EmailAdapter {
  constructor(protected mailerService: MailerService, private apiConfigService: ApiConfigService) {}

  async sendEmail({ email, subject, code, template }: EmailSendDto) {
    await this.mailerService.sendMail({
      from: `${this.apiConfigService.EMAIL_FROM} <${this.apiConfigService.EMAIL}>`,
      to: email,
      subject: subject,
      template: `./${template}`,
      context: { code },
    });
  }
}

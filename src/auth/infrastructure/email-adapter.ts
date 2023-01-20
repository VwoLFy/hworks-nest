import { settings } from '../../main/settings';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

type EmailSendDto = {
  email: string;
  subject: string;
  code: string;
  template: string;
};

@Injectable()
export class EmailAdapter {
  constructor(protected mailerService: MailerService) {}

  async sendEmail({ email, subject, code, template }: EmailSendDto) {
    await this.mailerService.sendMail({
      from: `${settings.EMAIL_FROM} <${settings.E_MAIL}>`,
      to: email,
      subject: subject,
      template: `./${template}`,
      context: { code },
    });
  }
}

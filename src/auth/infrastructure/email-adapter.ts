import { settings } from '../../main/settings';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailAdapter {
  constructor(protected mailerService: MailerService) {}

  async sendEmail(email: string, subject: string, message: string) {
    await this.mailerService.sendMail({
      from: `CodevwolF <${settings.E_MAIL}>`,
      to: email,
      subject: subject,
      html: message,
    });
  }
}

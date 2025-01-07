import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationEmail(
    email: string,
    code: string,
    subject: string,
    template: (code: string) => string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: template(code),
    });
  }
}

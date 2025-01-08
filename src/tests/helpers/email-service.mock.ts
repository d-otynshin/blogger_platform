import { EmailService } from '../../features/notifications/application/email.service';

export class EmailServiceMock extends EmailService {
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log(
      `Call mock method sendConfirmationEmail / EmailServiceMock: ${email} with code ${code}`,
    );

    return Promise.resolve();
  }
}

import { NotificationProvider } from '../../domain/notifications/notification-provider';
import { Channel } from '../../domain/entities/verification-code';
import { Resend } from 'resend';

export class EmailNotification implements NotificationProvider {
  readonly channels = [Channel.EMAIL];
  private resend = new Resend(process.env.EMAIL_RESEND_API_KEY!);

  validate(contact: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
      throw new Error(`Invalid email format for notification: ${contact}`);
    }
  }

  async send(contact: string, message: string): Promise<void> {
    console.log(`[EMAIL] Sending to ${contact}: ${message}`);
    const { data, error } = await this.resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [contact],
      subject: 'Código de verificación',
      html: `<h1> Tu código de verificación es: ${message} </h1>`,
    });

    if (error) {
      return console.error({ error });
    }
  }
}

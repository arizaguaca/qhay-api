import { NotificationProvider } from '../../domain/notifications/notification-provider';
import { Channel } from '../../domain/entities/verification-code';

export class SMSNotification implements NotificationProvider {
  readonly channels = [Channel.SMS];

  validate(contact: string): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(contact)) {
      throw new Error(`Invalid phone format for notification: ${contact}`);
    }
  }

  async send(contact: string, message: string): Promise<void> {
    console.log(`[SMS] Sending to ${contact}: ${message}`);
  }
}

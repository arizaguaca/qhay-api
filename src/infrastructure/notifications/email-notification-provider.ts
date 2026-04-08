import { NotificationProvider } from '../../domain/services/notification-provider';
import { Channel } from '../../domain/entities/verification-code';

export class EmailNotificationProvider implements NotificationProvider {
  readonly channel = Channel.EMAIL;

  async send(contact: string, message: string): Promise<void> {
    console.log(`[EMAIL] Sending to ${contact}: ${message}`);
  }
}

import { NotificationProvider } from '../../domain/services/notification-provider';
import { Channel } from '../../domain/entities/verification-code';
import { SMSService } from '../../domain/services/sms-service';

export class SMSNotificationProvider implements NotificationProvider {
  readonly channel = Channel.SMS;

  constructor(private smsService: SMSService) {}

  async send(contact: string, message: string): Promise<void> {
    await this.smsService.sendSMS(contact, message);
  }
}

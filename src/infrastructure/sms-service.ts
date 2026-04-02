import { SMSService } from '../domain/repositories/sms-service';

export class ConsoleSMSService implements SMSService {
  async sendSMS(phone: string, message: string): Promise<void> {
    console.log(`[SMS CONSOLE] Sending to ${phone}: ${message}`);
  }
}

export class TwilioSMSService implements SMSService {
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromPhone: string
  ) {}

  async sendSMS(phone: string, message: string): Promise<void> {
    // Implement Twilio API call
    // For now, console log
    console.log(`[SMS TWILIO] Sending to ${phone}: ${message}`);
  }
}
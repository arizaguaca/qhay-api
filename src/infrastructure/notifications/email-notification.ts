import { NotificationProvider } from '../../domain/notifications/notification-provider';
import { Channel } from '../../domain/entities/verification-code';
import { Config } from '../../config/config';
import { TemplateManager } from './template-manager';
import { Resend } from 'resend';

export class EmailNotification implements NotificationProvider {
  readonly channels = [Channel.EMAIL];
  private resend?: Resend;
  private from: string;
  private expirationMinutes: number;

  constructor(config: Config, private templateManager: TemplateManager) {
    this.from = config.emailFrom;
    this.expirationMinutes = config.verificationCodeExpirationMinutes;
    
    if (config.emailApiKey) {
      this.resend = new Resend(config.emailApiKey);
    } else {
      console.warn('[EMAIL] No API key provided for Resend. Emails will only be logged to console.');
    }
  }

  validate(contact: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
      throw new Error(`Invalid email format for notification: ${contact}`);
    }
  }

  async send(contact: string, message: string): Promise<void> {
    console.log(`[EMAIL] Sending to ${contact}: ${message}`);

    const template = this.templateManager.getEmail('verification', { 
      code: message,
      expiresIn: this.expirationMinutes.toString()
    });

    if (!this.resend) {
      console.log('[EMAIL] Skipping Resend call due to missing API key.');
      return;
    }
    
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: [contact],
      subject: template.subject,
      html: template.body,
    });

    if (error) {
      console.error({ error });
      throw error;
    }
  }
}

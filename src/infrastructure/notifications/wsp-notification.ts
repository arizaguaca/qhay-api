import { NotificationProvider } from '../../domain/notifications/notification-provider';
import { Channel } from '../../domain/entities/verification-code';
import { Config } from '../../config/config';
import { TemplateManager } from './template-manager';
import twilio from 'twilio';

export class WSPNotification implements NotificationProvider {
    readonly channels = [Channel.WHATSAPP];
    private client?: twilio.Twilio;
    private from: string;
    private expirationMinutes: number;

    constructor(config: Config, private templateManager: TemplateManager) {
        this.from = config.twilioWspPhone;
        this.expirationMinutes = config.verificationCodeExpirationMinutes;

        if (config.twilioSid && config.twilioAuth) {
            this.client = twilio(config.twilioSid, config.twilioAuth);
        } else {
            console.warn('[WhatsApp] No Twilio credentials provided. WhatsApp will only be logged to console.');
        }
    }

    validate(contact: string): void {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(contact)) {
            throw new Error(`Invalid phone format for notification: ${contact}`);
        }
    }

    async send(contact: string, message: string): Promise<void> {
        console.log(`[WhatsApp] Sending to ${contact}: ${message}`);
        const body = this.templateManager.getWSP('verification', { 
            code: message,
            expiresIn: this.expirationMinutes.toString()
        });

        if (!this.client) {
            console.log('[WhatsApp] Skipping Twilio call due to missing credentials.');
            return;
        }

        try {
            const response = await this.client.messages.create({
                body: body,
                from: `whatsapp:${this.from}`,
                to: `whatsapp:${contact}`
            });
            console.log('Success whatsapp con Twilio:', response.sid);
        } catch (error) {
            console.error('Error enviando whatsapp con Twilio:', error);
            throw error;
        }
    }
}

import { v4 as uuidv4 } from 'uuid';
import { Channel, VerificationCode } from '../../domain/entities/verification-code';
import { VerificationRepository } from '../../domain/repositories/verification-repository';
import { NotificationProvider } from '../../domain/notifications/notification-provider';
import { VerificationUseCase } from './verification-use-case';

import { VerificationEntityStrategy } from '../../domain/strategies/verification-entity-strategy';

export class VerificationUseCaseImpl implements VerificationUseCase {
  constructor(
    private verifyRepo: VerificationRepository,
    private providers: NotificationProvider[],
    private entityStrategies: VerificationEntityStrategy[],
    private expirationMinutes: number
  ) { }

  async sendCode(contact: string, channel: Channel): Promise<void> {
    const strategy = this.getEntityStrategy(channel);
    const entityId = await strategy.getEntityId(contact);

    const code = this.generateRandomCode(6);
    const verification: VerificationCode = {
      id: uuidv4(),
      entityId: entityId,
      contact,
      channel,
      code,
      verified: false,
      expiresAt: new Date(Date.now() + this.expirationMinutes * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.verifyRepo.create(verification);

    const provider = this.getNotificationProvider(channel);
    if (provider.validate) {
      provider.validate(contact);
    }

    await provider.send(contact, code);
  }

  async verifyCode(contact: string, code: string): Promise<string> {
    const verification = await this.verifyRepo.getLatestByContact(contact);
    if (!verification || verification.code !== code || verification.expiresAt < new Date()) {
      throw new Error('Invalid or expired code');
    }

    verification.verified = true;
    verification.updatedAt = new Date();
    await this.verifyRepo.update(verification);

    const strategy = this.getEntityStrategy(verification.channel);
    await strategy.onVerified(contact);

    return verification.entityId;
  }

  private getEntityStrategy(channel: Channel): VerificationEntityStrategy {
    const strategy = this.entityStrategies.find(s => s.channels.includes(channel));
    if (!strategy) {
      throw new Error(`No entity strategy found for channel ${channel}`);
    }
    return strategy;
  }

  private getNotificationProvider(channel: Channel): NotificationProvider {
    const provider = this.providers.find(p => p.channels.includes(channel));
    if (!provider) {
      throw new Error(`Notification provider for ${channel} is not configured`);
    }
    return provider;
  }

  private generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
import { v4 as uuidv4 } from 'uuid';
import { Channel, VerificationCode } from '../../domain/entities/verification-code';
import { VerificationRepository } from '../../domain/repositories/verification-repository';
import { SMSService } from '../../domain/repositories/sms-service';
import { CustomerRepository } from '../../domain/repositories/customer-repository';
import { VerificationUseCase } from './verification-use-case';

export class VerificationUseCaseImpl implements VerificationUseCase {
  constructor(
    private verifyRepo: VerificationRepository,
    private customerRepo: CustomerRepository,
    private smsService: SMSService
  ) { }

  async sendCode(contact: string, channel: Channel): Promise<void> {
    const customer = await this.customerRepo.getByPhone(contact);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const code = this.generateRandomCode(6);
    const verification: VerificationCode = {
      id: uuidv4(),
      entityId: customer.id,
      contact,
      channel,
      code,
      verified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.verifyRepo.create(verification);

    if (channel === Channel.SMS) {
      await this.smsService.sendSMS(contact, `Your verification code is: ${code}`);
    }
  }

  async verifyCode(contact: string, code: string): Promise<string> {
    const verification = await this.verifyRepo.getLatestByContact(contact);
    if (!verification || verification.code !== code || verification.expiresAt < new Date()) {
      throw new Error('Invalid or expired code');
    }

    verification.verified = true;
    verification.updatedAt = new Date();
    await this.verifyRepo.update(verification);

    const customer = await this.customerRepo.getByPhone(contact);
    if (customer) {
      customer.isActive = true;
      customer.updatedAt = new Date();
      await this.customerRepo.update(customer);
    }

    return verification.entityId;

  }

  private generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
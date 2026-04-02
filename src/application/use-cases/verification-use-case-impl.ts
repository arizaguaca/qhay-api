import { v4 as uuidv4 } from 'uuid';
import { VerificationCode } from '../../domain/entities/verification-code';
import { VerificationRepository } from '../../domain/repositories/verification-repository';
import { SMSService } from '../../domain/repositories/sms-service';
import { CustomerRepository } from '../../domain/repositories/customer-repository';

export class VerificationUseCaseImpl {
  constructor(
    private verifyRepo: VerificationRepository,
    private customerRepo: CustomerRepository,
    private smsService: SMSService
  ) {}

  async sendCode(phone: string): Promise<void> {
    const code = this.generateRandomCode(6);
    const verification: VerificationCode = {
      id: uuidv4(),
      phone,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    };

    await this.verifyRepo.create(verification);
    await this.smsService.sendSMS(phone, `Your verification code is: ${code}`);
  }

  async verifyCode(phone: string, code: string): Promise<string> {
    const verification = await this.verifyRepo.getLatestByPhone(phone);
    if (!verification || verification.code !== code || verification.expiresAt < new Date()) {
      throw new Error('Invalid or expired code');
    }

    // Create customer if not exists
    const existingCustomer = await this.customerRepo.getByPhone(phone);
    if (!existingCustomer) {
      const newCustomer = {
        id: uuidv4(),
        name: '',
        phone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.customerRepo.create(newCustomer);
      await this.verifyRepo.deleteByPhone(phone);
      return newCustomer.id;
    } else {
      await this.verifyRepo.deleteByPhone(phone);
      return existingCustomer.id;
    }
  }

  private generateRandomCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}
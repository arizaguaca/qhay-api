import { Channel, EntityType } from '../../domain/entities/verification-code';
import { VerificationEntityStrategy } from '../../domain/strategies/verification-entity-strategy';
import { CustomerRepository } from '../../domain/repositories/customer-repository';

export class CustomerLookupStrategy implements VerificationEntityStrategy {
  readonly entityType = EntityType.CUSTOMER;
  readonly channels = [Channel.SMS, Channel.WHATSAPP];

  constructor(private customerRepo: CustomerRepository) {}

  async getEntityId(contact: string): Promise<string> {
    const customer = await this.customerRepo.getByPhone(contact);
    if (!customer) {
      throw new Error('Customer not found with provided phone');
    }
    return customer.id;
  }

  async onVerified(contact: string): Promise<void> {
    const customer = await this.customerRepo.getByPhone(contact);
    if (customer) {
      customer.isActive = true;
      customer.updatedAt = new Date();
      await this.customerRepo.update(customer);
    }
  }
}

import { Channel, EntityType } from '../../domain/entities/verification-code';
import { VerificationEntityStrategy } from '../../domain/strategies/verification-entity-strategy';
import { UserRepository } from '../../domain/repositories/user-repository';

export class UserLookupStrategy implements VerificationEntityStrategy {
  readonly entityType = EntityType.USER;
  readonly channels = [Channel.EMAIL, Channel.SMS, Channel.WHATSAPP];

  constructor(private userRepo: UserRepository) {}

  async getEntityId(contact: string): Promise<string> {
    const user = contact.includes('@') 
      ? await this.userRepo.getByEmail(contact)
      : await this.userRepo.getByPhone(contact);
      
    if (!user) {
      throw new Error(`User not found with provided ${contact.includes('@') ? 'email' : 'phone'}`);
    }
    return user.id;
  }

  async onVerified(contact: string): Promise<void> {
    const user = contact.includes('@')
      ? await this.userRepo.getByEmail(contact)
      : await this.userRepo.getByPhone(contact);
      
    if (user) {
      user.isVerified = true;
      user.updatedAt = new Date();
      await this.userRepo.update(user);
    }
  }
}

import { Channel } from '../../domain/entities/verification-code';
import { VerificationEntityStrategy } from '../../domain/strategies/verification-entity-strategy';
import { UserRepository } from '../../domain/repositories/user-repository';

export class UserLookupStrategy implements VerificationEntityStrategy {
  readonly channels = [Channel.EMAIL];

  constructor(private userRepo: UserRepository) {}

  async getEntityId(contact: string): Promise<string> {
    const user = await this.userRepo.getByEmail(contact);
    if (!user) {
      throw new Error('User not found with provided email');
    }
    return user.id;
  }

  async onVerified(contact: string): Promise<void> {
    const user = await this.userRepo.getByEmail(contact);
    if (user) {
      user.isVerified = true;
      user.updatedAt = new Date();
      await this.userRepo.update(user);
    }
  }
}

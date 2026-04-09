import { Channel } from '../entities/verification-code';

export interface VerificationEntityStrategy {
  channels: Channel[];
  getEntityId(contact: string): Promise<string>;
  onVerified(contact: string): Promise<void>;
}

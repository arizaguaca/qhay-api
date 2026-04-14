import { Channel, EntityType } from '../entities/verification-code';

export interface VerificationEntityStrategy {
  entityType: EntityType;
  channels: Channel[];
  getEntityId(contact: string): Promise<string>;
  onVerified(contact: string): Promise<void>;
}

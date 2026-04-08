import { VerificationCode } from '../entities/verification-code';

export interface VerificationRepository {
  create(verification: VerificationCode): Promise<void>;
  update(verification: VerificationCode): Promise<void>;
  getLatestByContact(contact: string): Promise<VerificationCode | null>;
  deleteByContact(contact: string): Promise<void>;
}
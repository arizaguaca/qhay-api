import { VerificationCode } from '../entities/verification-code';

export interface VerificationRepository {
  create(verification: VerificationCode): Promise<void>;
  getLatestByPhone(phone: string): Promise<VerificationCode | null>;
  deleteByPhone(phone: string): Promise<void>;
}
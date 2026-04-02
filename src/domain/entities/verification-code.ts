export interface VerificationCode {
  id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}
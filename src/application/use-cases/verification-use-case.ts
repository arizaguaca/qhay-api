export interface VerificationUseCase {
  sendCode(phone: string): Promise<void>;
  verifyCode(phone: string, code: string): Promise<string>;
}
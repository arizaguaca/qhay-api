import { Channel } from "../../domain/entities/verification-code";

export interface VerificationUseCase {
  sendCode(contact: string, channel: Channel): Promise<void>;
  verifyCode(contact: string, code: string): Promise<string>;
}
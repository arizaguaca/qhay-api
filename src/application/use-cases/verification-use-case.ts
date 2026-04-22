import { Channel, EntityType } from "../../domain/entities/verification-code";

export interface VerificationUseCase {
  sendCode(contact: string, channel: Channel, entityType: EntityType): Promise<void>;
  verifyCode(contact: string, code: string): Promise<string>;
}
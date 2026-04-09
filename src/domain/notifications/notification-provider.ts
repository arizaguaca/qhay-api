import { Channel } from '../entities/verification-code';

export interface NotificationProvider {
  channels: Channel[];
  send(contact: string, message: string): Promise<void>;
  validate?(contact: string): void;
}

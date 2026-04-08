import { Channel } from '../entities/verification-code';

export interface NotificationProvider {
  channel: Channel;
  send(contact: string, message: string): Promise<void>;
}

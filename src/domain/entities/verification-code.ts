export enum Channel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms'
}

export interface VerificationCode {
  id: string;
  entityId: string;
  contact: string;
  channel: Channel;
  code: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
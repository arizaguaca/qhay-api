export enum Channel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms'
}

export enum EntityType {
  USER = 'user',
  CUSTOMER = 'customer'
}

export interface VerificationCode {
  id: string;
  entityId: string;
  entityType: EntityType;
  contact: string;
  channel: Channel;
  code: string;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
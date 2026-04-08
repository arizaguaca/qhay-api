export interface SMSService {
  sendSMS(contact: string, message: string): Promise<void>;
}
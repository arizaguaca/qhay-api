export interface SMSService {
  sendSMS(phone: string, message: string): Promise<void>;
}
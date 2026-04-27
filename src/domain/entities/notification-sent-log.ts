export interface NotificationSentLog {
  id: string;
  customerId: string;
  restaurantId: string;
  notificationType?: string | null;
  sentAt: Date;
}

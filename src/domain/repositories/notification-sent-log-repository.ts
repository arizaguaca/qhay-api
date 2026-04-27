import { NotificationSentLog } from '../entities/notification-sent-log';

export interface NotificationSentLogRepository {
  create(log: NotificationSentLog): Promise<void>;
  fetchByCustomerId(customerId: string): Promise<NotificationSentLog[]>;
  fetchByRestaurantId(restaurantId: string): Promise<NotificationSentLog[]>;
}

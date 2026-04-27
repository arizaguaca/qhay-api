import { NotificationSentLog } from '../../domain/entities/notification-sent-log';
import { NotificationSentLogRepository } from '../../domain/repositories/notification-sent-log-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLNotificationSentLogRepository implements NotificationSentLogRepository {
  constructor(private db: MySQLConnection) {}

  async create(log: NotificationSentLog): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO notifications_sent_log (id, customer_id, restaurant_id, notification_type, sent_at) VALUES (?, ?, ?, ?, ?)',
      [log.id, log.customerId, log.restaurantId, log.notificationType ?? null, toMySqlDateTime(log.sentAt)]
    );
  }

  async fetchByCustomerId(customerId: string): Promise<NotificationSentLog[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM notifications_sent_log WHERE customer_id = ?', [customerId]);
    return (rows as any[]).map(row => this.mapRow(row));
  }

  async fetchByRestaurantId(restaurantId: string): Promise<NotificationSentLog[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM notifications_sent_log WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => this.mapRow(row));
  }

  private mapRow(row: any): NotificationSentLog {
    return {
      id: row.id,
      customerId: row.customer_id,
      restaurantId: row.restaurant_id,
      notificationType: row.notification_type,
      sentAt: new Date(row.sent_at),
    };
  }
}

import { OrderStatusHistory } from '../../domain/entities/order-status-history';
import { OrderStatusHistoryRepository } from '../../domain/repositories/order-status-history-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLOrderStatusHistoryRepository implements OrderStatusHistoryRepository {
  constructor(private db: MySQLConnection) {}

  async create(entry: OrderStatusHistory): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO order_status_history (id, order_id, status, changed_at, changed_by_user_id) VALUES (?, ?, ?, ?, ?)',
      [
        entry.id,
        entry.orderId,
        entry.status,
        toMySqlDateTime(entry.changedAt),
        entry.changedByUserId ?? null,
      ]
    );
  }

  async fetchByOrderId(orderId: string): Promise<OrderStatusHistory[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC',
      [orderId]
    );
    return (rows as any[]).map(row => ({
      id: row.id,
      orderId: row.order_id,
      status: row.status,
      changedAt: new Date(row.changed_at),
      changedByUserId: row.changed_by_user_id ?? null,
    }));
  }
}

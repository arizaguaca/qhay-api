import { Order, OrderItem, OrderItemModifier } from '../../domain/entities/order';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date | number): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLOrderRepository implements OrderRepository {
  constructor(private db: MySQLConnection) {}

  async create(order: Order): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO orders (id, restaurant_id, customer_id, table_number, status, cancelled_by, total_amount, cancellation_reason, cancelled_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        order.id,
        order.restaurantId,
        order.customerId,
        order.tableNumber,
        order.status,
        order.cancelledBy ?? null,
        order.totalAmount,
        order.cancellationReason ?? null,
        order.cancelledByUserId ?? null,
      ]
    );

    for (const item of order.items) {
      if (!item.id) {
        item.id = require('uuid').v4();
      }
      item.orderId = order.id;
      await conn.execute(
        'INSERT INTO order_items (id, order_id, menu_item_id, name, quantity, unit_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item.id,
          item.orderId,
          item.menuItemId,
          item.name || null,
          item.quantity,
          item.unitPrice,
          item.notes || null,
        ]
      );

      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifier of item.modifiers) {
          if (!modifier.id) {
            modifier.id = require('uuid').v4();
          }
          await conn.execute(
            'INSERT INTO order_item_modifiers (id, order_item_id, product_option_id, name, price) VALUES (?, ?, ?, ?, ?)',
            [
              modifier.id,
              item.id,
              modifier.productOptionId,
              modifier.name,
              modifier.price,
            ]
          );
        }
      }
    }
  }

  async getById(id: string): Promise<Order | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    const items = await this.getOrderItems(id);
    return this.mapRow(row, items);
  }

  async fetchByRestaurantId(restaurantId: string, statuses?: string[]): Promise<Order[]> {
    const conn = this.db.getConnection();
    let query = 'SELECT * FROM orders WHERE restaurant_id = ?';
    const params: any[] = [restaurantId];

    if (statuses && statuses.length > 0) {
      const placeholders = statuses.map(() => '?').join(', ');
      query += ` AND status IN (${placeholders})`;
      params.push(...statuses);
    }

    const [rows] = await conn.execute(query, params);
    return this.mapRows(rows as any[]);
  }

  async fetchByCustomerId(customerId: string): Promise<Order[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM orders WHERE customer_id = ?', [customerId]);
    return this.mapRows(rows as any[]);
  }

  async fetchByTableAndRestaurant(restaurantId: string, tableNumber: number, statuses?: string[]): Promise<Order[]> {
    const conn = this.db.getConnection();
    let query = 'SELECT * FROM orders WHERE restaurant_id = ? AND table_number = ?';
    const params: any[] = [restaurantId, tableNumber];

    if (statuses && statuses.length > 0) {
      const placeholders = statuses.map(() => '?').join(', ');
      query += ` AND status IN (${placeholders})`;
      params.push(...statuses);
    }

    const [rows] = await conn.execute(query, params);
    return this.mapRows(rows as any[]);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, toMySqlDateTime(new Date()), id]);
  }

  async updateCustomerAndOrigin(id: string, customerId: string, originCustomerId: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE orders SET customer_id = ?, origin_customer_id = ?, updated_at = ? WHERE id = ?',
      [customerId, originCustomerId, toMySqlDateTime(new Date()), id]
    );
  }

  async update(order: Order): Promise<void> {
    const conn = this.db.getConnection();
    order.updatedAt = new Date();
    await conn.execute(
      'UPDATE orders SET table_number = ?, status = ?, cancelled_by = ?, total_amount = ?, cancellation_reason = ?, cancelled_by_user_id = ?, updated_at = ? WHERE id = ?',
      [
        order.tableNumber,
        order.status,
        order.cancelledBy ?? null,
        order.totalAmount,
        order.cancellationReason ?? null,
        order.cancelledByUserId ?? null,
        toMySqlDateTime(order.updatedAt),
        order.id,
      ]
    );
  }

  private async mapRows(rows: any[]): Promise<Order[]> {
    const orders: Order[] = [];
    for (const row of rows) {
      const items = await this.getOrderItems(row.id);
      orders.push(this.mapRow(row, items));
    }
    return orders;
  }

  private mapRow(row: any, items: OrderItem[]): Order {
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      customerId: row.customer_id,
      originCustomerId: row.origin_customer_id ?? null,
      tableNumber: row.table_number,
      items,
      status: row.status,
      cancelledBy: row.cancelled_by ?? null,
      totalAmount: row.total_amount,
      cancellationReason: row.cancellation_reason ?? null,
      cancelledByUserId: row.cancelled_by_user_id ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const conn = this.db.getConnection();
    const [itemRows] = await conn.execute(
      `SELECT oi.*, mi.prep_time 
       FROM order_items oi 
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    const items: OrderItem[] = [];

    for (const itemRow of itemRows as any[]) {
      const [modRows] = await conn.execute('SELECT * FROM order_item_modifiers WHERE order_item_id = ?', [itemRow.id]);
      const modifiers: OrderItemModifier[] = (modRows as any[]).map(modRow => ({
        id: modRow.id,
        orderItemId: modRow.order_item_id,
        productOptionId: modRow.product_option_id,
        name: modRow.name,
        price: modRow.price,
        createdAt: new Date(modRow.created_at),
      }));

      items.push({
        id: itemRow.id,
        orderId: itemRow.order_id,
        menuItemId: itemRow.menu_item_id,
        name: itemRow.name,
        quantity: itemRow.quantity,
        unitPrice: itemRow.unit_price,
        notes: itemRow.notes,
        prepTime: itemRow.prep_time,
        modifiers,
      });
    }

    return items;
  }
}

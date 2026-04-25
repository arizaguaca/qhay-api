import { Order, OrderItem } from '../../domain/entities/order';
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
      'INSERT INTO orders (id, restaurant_id, customer_id, table_number, status, total_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        order.id,
        order.restaurantId,
        order.customerId,
        order.tableNumber,
        order.status,
        order.totalPrice,
        toMySqlDateTime(order.createdAt),
        toMySqlDateTime(order.updatedAt),
      ]
    );

    // Insert order items
    for (const item of order.items) {
      if (!item.id) {
        item.id = require('uuid').v4();
      }
      item.orderId = order.id;
      await conn.execute(
        'INSERT INTO order_items (id, order_id, menu_item_id, name, quantity, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item.id,
          item.orderId,
          item.menuItemId,
          item.name || null,
          item.quantity,
          item.price,
          item.notes || null,
        ]
      );
    }
  }

  async getById(id: string): Promise<Order | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];

    // Get order items
    const [itemRows] = await conn.execute('SELECT * FROM order_items WHERE order_id = ?', [id]);
    const items: OrderItem[] = (itemRows as any[]).map(itemRow => ({
      id: itemRow.id,
      orderId: itemRow.order_id,
      menuItemId: itemRow.menu_item_id,
      name: itemRow.name,
      quantity: itemRow.quantity,
      price: itemRow.price,
      notes: itemRow.notes,
    }));

    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      customerId: row.customer_id,
      tableNumber: row.table_number,
      items,
      status: row.status,
      totalPrice: row.total_price,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async fetchByRestaurantId(restaurantId: string): Promise<Order[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM orders WHERE restaurant_id = ?', [restaurantId]);
    const orders: Order[] = [];
    for (const row of rows as any[]) {
      const items = await this.getOrderItems(row.id);
      orders.push({
        id: row.id,
        restaurantId: row.restaurant_id,
        customerId: row.customer_id,
        tableNumber: row.table_number,
        items,
        status: row.status,
        totalPrice: row.total_price,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }
    return orders;
  }

  async fetchByCustomerId(customerId: string): Promise<Order[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM orders WHERE customer_id = ?', [customerId]);
    const orders: Order[] = [];
    for (const row of rows as any[]) {
      const items = await this.getOrderItems(row.id);
      orders.push({
        id: row.id,
        restaurantId: row.restaurant_id,
        customerId: row.customer_id,
        tableNumber: row.table_number,
        items,
        status: row.status,
        totalPrice: row.total_price,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      });
    }
    return orders;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, toMySqlDateTime(new Date()), id]);
  }

  async update(order: Order): Promise<void> {
    const conn = this.db.getConnection();
    order.updatedAt = new Date();
    await conn.execute(
      'UPDATE orders SET table_number = ?, status = ?, total_price = ?, updated_at = ? WHERE id = ?',
      [
        order.tableNumber,
        order.status,
        order.totalPrice,
        toMySqlDateTime(order.updatedAt),
        order.id,
      ]
    );
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const conn = this.db.getConnection();
    const [itemRows] = await conn.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return (itemRows as any[]).map(itemRow => ({
      id: itemRow.id,
      orderId: itemRow.order_id,
      menuItemId: itemRow.menu_item_id,
      name: itemRow.name,
      quantity: itemRow.quantity,
      price: itemRow.price,
      notes: itemRow.notes,
    }));
  }
}
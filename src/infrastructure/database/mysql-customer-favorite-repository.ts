import { CustomerFavorite } from '../../domain/entities/customer-favorite';
import { CustomerFavoriteRepository } from '../../domain/repositories/customer-favorite-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLCustomerFavoriteRepository implements CustomerFavoriteRepository {
  constructor(private db: MySQLConnection) {}

  async create(favorite: CustomerFavorite): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO customer_favorites (id, customer_id, menu_item_id, created_at) VALUES (?, ?, ?, ?)',
      [favorite.id, favorite.customerId, favorite.menuItemId, toMySqlDateTime(favorite.createdAt)]
    );
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM customer_favorites WHERE id = ?', [id]);
  }

  async deleteByCustomerAndItem(customerId: string, menuItemId: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'DELETE FROM customer_favorites WHERE customer_id = ? AND menu_item_id = ?',
      [customerId, menuItemId]
    );
  }

  async fetchByCustomerId(customerId: string): Promise<CustomerFavorite[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM customer_favorites WHERE customer_id = ?', [customerId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      customerId: row.customer_id,
      menuItemId: row.menu_item_id,
      createdAt: new Date(row.created_at),
    }));
  }

  async getByCustomerAndItem(customerId: string, menuItemId: string): Promise<CustomerFavorite | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM customer_favorites WHERE customer_id = ? AND menu_item_id = ?',
      [customerId, menuItemId]
    );
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      customerId: row.customer_id,
      menuItemId: row.menu_item_id,
      createdAt: new Date(row.created_at),
    };
  }
}

import { MenuItem } from '../../domain/entities/menu-item';
import { MenuRepository } from '../../domain/repositories/menu-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLMenuRepository implements MenuRepository {
  constructor(private db: MySQLConnection) {}

  async create(item: MenuItem): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO menu_items (id, restaurant_id, name, description, price, prep_time, image_url, is_available, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.restaurantId,
        item.name,
        item.description,
        item.price,
        item.prepTime,
        item.imageUrl,
        item.isAvailable,
        item.createdAt.getTime(),
        item.updatedAt.getTime(),
      ]
    );
  }

  async getById(id: string): Promise<MenuItem | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description,
      price: row.price,
      prepTime: row.prep_time,
      imageUrl: row.image_url,
      isAvailable: row.is_available === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async fetchByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description,
      price: row.price,
      prepTime: row.prep_time,
      imageUrl: row.image_url,
      isAvailable: row.is_available === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(item: MenuItem): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, prep_time = ?, image_url = ?, is_available = ?, updated_at = ? WHERE id = ?',
      [
        item.name,
        item.description,
        item.price,
        item.prepTime,
        item.imageUrl,
        item.isAvailable,
        item.updatedAt.getTime(),
        item.id,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM menu_items WHERE id = ?', [id]);
  }
}
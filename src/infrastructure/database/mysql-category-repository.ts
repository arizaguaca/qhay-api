import { Category } from '../../domain/entities/category';
import { CategoryRepository } from '../../domain/repositories/category-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLCategoryRepository implements CategoryRepository {
  constructor(private db: MySQLConnection) {}

  async create(category: Category): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO menu_categories (id, restaurant_id, name, is_custom) VALUES (?, ?, ?, ?)',
      [category.id, category.restaurantId ?? null, category.name, category.isCustom ? 1 : 0]
    );
  }

  async fetchByRestaurantId(restaurantId: string): Promise<Category[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM menu_categories WHERE restaurant_id = ? OR restaurant_id IS NULL',
      [restaurantId]
    );
    return (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      isCustom: row.is_custom === 1,
    }));
  }

  async getById(id: string): Promise<Category | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_categories WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      isCustom: row.is_custom === 1,
    };
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM menu_categories WHERE id = ?', [id]);
  }
}

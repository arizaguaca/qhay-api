import { CuisineType } from '../../domain/entities/cuisine-type';
import { CuisineTypeRepository } from '../../domain/repositories/cuisine-type-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLCuisineTypeRepository implements CuisineTypeRepository {
  constructor(private db: MySQLConnection) {}

  async create(cuisineType: CuisineType): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO cuisine_types (id, owner_id, name, is_custom) VALUES (?, ?, ?, ?)',
      [cuisineType.id, cuisineType.ownerId ?? null, cuisineType.name, cuisineType.isCustom ? 1 : 0]
    );
  }

  async fetchAll(): Promise<CuisineType[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM cuisine_types WHERE owner_id IS NULL');
    return (rows as any[]).map(row => ({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      isCustom: row.is_custom === 1,
    }));
  }

  async fetchByOwnerId(ownerId: string): Promise<CuisineType[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM cuisine_types WHERE owner_id = ? OR owner_id IS NULL',
      [ownerId]
    );
    return (rows as any[]).map(row => ({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      isCustom: row.is_custom === 1,
    }));
  }

  async getById(id: string): Promise<CuisineType | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM cuisine_types WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      isCustom: row.is_custom === 1,
    };
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM cuisine_types WHERE id = ?', [id]);
  }
}

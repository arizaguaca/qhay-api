import { Mall } from '../../domain/entities/mall';
import { MallRepository } from '../../domain/repositories/mall-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLMallRepository implements MallRepository {
  constructor(private db: MySQLConnection) {}

  async fetch(): Promise<Mall[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM malls ORDER BY name ASC');
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      city: row.city,
    }));
  }

  async getById(id: string): Promise<Mall | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM malls WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      city: row.city,
    };
  }
}

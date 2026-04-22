import { City } from '../../domain/entities/city';
import { CityRepository } from '../../domain/repositories/city-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLCityRepository implements CityRepository {
  constructor(private db: MySQLConnection) {}

  async fetchAll(): Promise<City[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM cities');
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      state: row.state,
      country: row.country,
    }));
  }

  async getById(id: string): Promise<City | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM cities WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      state: row.state,
      country: row.country,
    };
  }
}

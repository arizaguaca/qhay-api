import { OperatingHour } from '../../domain/entities/operating-hour';
import { OperatingHourRepository } from '../../domain/repositories/operating-hour-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLOperatingHourRepository implements OperatingHourRepository {
  constructor(private db: MySQLConnection) {}

  async create(hour: OperatingHour): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO operating_hours (id, restaurant_id, day_of_week, open_time, close_time, is_closed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        hour.id,
        hour.restaurantId,
        hour.dayOfWeek,
        hour.openTime,
        hour.closeTime,
        hour.isClosed,
        hour.createdAt.getTime(),
        hour.updatedAt.getTime(),
      ]
    );
  }

  async update(hour: OperatingHour): Promise<void> {
    const conn = this.db.getConnection();
    hour.updatedAt = new Date();
    await conn.execute(
      'UPDATE operating_hours SET day_of_week = ?, open_time = ?, close_time = ?, is_closed = ?, updated_at = ? WHERE id = ?',
      [
        hour.dayOfWeek,
        hour.openTime,
        hour.closeTime,
        hour.isClosed,
        hour.updatedAt.getTime(),
        hour.id,
      ]
    );
  }

  async getByRestaurantId(restaurantId: string): Promise<OperatingHour[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM operating_hours WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      dayOfWeek: row.day_of_week,
      openTime: row.open_time,
      closeTime: row.close_time,
      isClosed: row.is_closed === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getByRestaurantAndDay(restaurantId: string, day: number): Promise<OperatingHour | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM operating_hours WHERE restaurant_id = ? AND day_of_week = ?', [restaurantId, day]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      dayOfWeek: row.day_of_week,
      openTime: row.open_time,
      closeTime: row.close_time,
      isClosed: row.is_closed === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM operating_hours WHERE id = ?', [id]);
  }
}
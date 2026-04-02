import { Restaurant } from '../../domain/entities/restaurant';
import { RestaurantRepository } from '../../domain/repositories/restaurant-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLRestaurantRepository implements RestaurantRepository {
  constructor(private db: MySQLConnection) {}

  async create(restaurant: Restaurant): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO restaurants (id, name, description, address, phone, owner_id, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        restaurant.id,
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.phone,
        restaurant.ownerId,
        restaurant.logoUrl,
        restaurant.createdAt.getTime(),
        restaurant.updatedAt.getTime(),
      ]
    );
  }

  async getById(id: string): Promise<Restaurant | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM restaurants WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      phone: row.phone,
      ownerId: row.owner_id,
      logoUrl: row.logo_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async fetch(): Promise<Restaurant[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM restaurants');
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      phone: row.phone,
      ownerId: row.owner_id,
      logoUrl: row.logo_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getByOwnerId(ownerId: string): Promise<Restaurant[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM restaurants WHERE owner_id = ?', [ownerId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      phone: row.phone,
      ownerId: row.owner_id,
      logoUrl: row.logo_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(restaurant: Restaurant): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE restaurants SET name = ?, description = ?, address = ?, phone = ?, logo_url = ?, updated_at = ? WHERE id = ?',
      [
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.phone,
        restaurant.logoUrl,
        restaurant.updatedAt.getTime(),
        restaurant.id,
      ]
    );
  }
}
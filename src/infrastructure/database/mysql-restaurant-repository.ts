import { Restaurant } from '../../domain/entities/restaurant';
import { RestaurantRepository } from '../../domain/repositories/restaurant-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLRestaurantRepository implements RestaurantRepository {
  constructor(private db: MySQLConnection) {}

  async create(restaurant: Restaurant): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO restaurants (id, name, description, address, phone, location_type, cuisine_type, city_id, mall_id, link, owner_id, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        restaurant.id,
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.phone,
        restaurant.locationType,
        restaurant.cuisineType,
        restaurant.cityId,
        restaurant.mallId ?? null,
        restaurant.link ?? null,
        restaurant.ownerId,
        restaurant.logoUrl,
        toMySqlDateTime(restaurant.createdAt),
        toMySqlDateTime(restaurant.updatedAt),
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
      locationType: row.location_type ?? '',
      cuisineType: row.cuisine_type ?? '',
      cityId: row.city_id,
      mallId: row.mall_id ?? null,
      link: row.link ?? null,
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
      locationType: row.location_type ?? '',
      cuisineType: row.cuisine_type ?? '',
      cityId: row.city_id,
      mallId: row.mall_id ?? null,
      link: row.link ?? null,
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
      locationType: row.location_type ?? '',
      cuisineType: row.cuisine_type ?? '',
      cityId: row.city_id,
      mallId: row.mall_id ?? null,
      link: row.link ?? null,
      ownerId: row.owner_id,
      logoUrl: row.logo_url,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(restaurant: Restaurant): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE restaurants SET name = ?, description = ?, address = ?, phone = ?, location_type = ?, cuisine_type = ?, city_id = ?, mall_id = ?, link = ?, logo_url = ?, updated_at = ? WHERE id = ?',
      [
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.phone,
        restaurant.locationType,
        restaurant.cuisineType,
        restaurant.cityId,
        restaurant.mallId ?? null,
        restaurant.link ?? null,
        restaurant.logoUrl,
        toMySqlDateTime(restaurant.updatedAt),
        restaurant.id,
      ]
    );
  }
}
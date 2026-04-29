import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/user-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLUserRepository implements UserRepository {
  constructor(private db: MySQLConnection) { }

  async create(user: User): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO users (id, full_name, email, phone, password, role, restaurant_id, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        user.fullName,
        user.email,
        user.phone || null,
        user.password,
        user.role,
        user.restaurantId || null,
        user.isVerified || false,
        toMySqlDateTime(user.createdAt),
        toMySqlDateTime(user.updatedAt),
      ]
    );
  }

  async getById(id: string): Promise<User | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
    if ((rows as any[]).length === 0) return null;
    return this.mapRow((rows as any[])[0]);
  }

  async getByEmail(email: string): Promise<User | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    if ((rows as any[]).length === 0) return null;
    return this.mapRow((rows as any[])[0]);
  }

  async getByPhone(phone: string): Promise<User | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL', [phone]);
    if ((rows as any[]).length === 0) return null;
    return this.mapRow((rows as any[])[0]);
  }

  async getStaffByRestaurant(restaurantId: string): Promise<User[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE restaurant_id = ? AND deleted_at IS NULL', [restaurantId]);
    return (rows as any[]).map(row => this.mapRow(row));
  }

  async fetch(): Promise<User[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM users WHERE deleted_at IS NULL');
    return (rows as any[]).map(row => this.mapRow(row));
  }

  async update(user: User): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, role = ?, restaurant_id = ?, is_verified = ?, updated_at = ? WHERE id = ?',
      [
        user.fullName,
        user.email,
        user.phone,
        user.role,
        user.restaurantId || null,
        user.isVerified || false,
        toMySqlDateTime(user.updatedAt),
        user.id,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      password: row.password,
      role: row.role,
      restaurantId: row.restaurant_id,
      isVerified: row.is_verified === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
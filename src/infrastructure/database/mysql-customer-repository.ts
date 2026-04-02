import { Customer } from '../../domain/entities/customer';
import { CustomerRepository } from '../../domain/repositories/customer-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLCustomerRepository implements CustomerRepository {
  constructor(private db: MySQLConnection) {}

  async create(customer: Customer): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO customers (id, name, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        customer.id,
        customer.name || null,
        customer.phone,
        customer.isActive,
        customer.createdAt.getTime(),
        customer.updatedAt.getTime(),
      ]
    );
  }

  async getById(id: string): Promise<Customer | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM customers WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM customers WHERE phone = ?', [phone]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async update(customer: Customer): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE customers SET name = ?, phone = ?, is_active = ?, updated_at = ? WHERE id = ?',
      [
        customer.name || null,
        customer.phone,
        customer.isActive,
        customer.updatedAt.getTime(),
        customer.id,
      ]
    );
  }
}
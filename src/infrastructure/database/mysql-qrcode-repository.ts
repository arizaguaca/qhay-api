import { QRCode } from '../../domain/entities/qrcode';
import { QRCodeRepository } from '../../domain/repositories/qrcode-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLQRCodeRepository implements QRCodeRepository {
  constructor(private db: MySQLConnection) {}

  async create(qrCode: QRCode): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO qrcodes (id, restaurant_id, table_number, label, slug_path, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        qrCode.id,
        qrCode.restaurantId,
        qrCode.tableNumber,
        qrCode.label,
        qrCode.slugPath,
        qrCode.isActive ? 1 : 0,
        qrCode.createdAt.toISOString().slice(0, 19).replace('T', ' '),
        qrCode.updatedAt.toISOString().slice(0, 19).replace('T', ' '),
      ]
    );
  }

  async getById(id: string): Promise<QRCode | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM qrcodes WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      label: row.label,
      slugPath: row.slug_path,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getByRestaurantId(restaurantId: string): Promise<QRCode[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM qrcodes WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      label: row.label,
      slugPath: row.slug_path,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getByTableNumber(restaurantId: string, tableNumber: number): Promise<QRCode | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM qrcodes WHERE restaurant_id = ? AND table_number = ?', [restaurantId, tableNumber]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      label: row.label,
      slugPath: row.slug_path,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM qrcodes WHERE id = ?', [id]);
  }
}
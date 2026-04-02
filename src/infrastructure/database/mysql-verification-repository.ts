import { VerificationCode } from '../../domain/entities/verification-code';
import { VerificationRepository } from '../../domain/repositories/verification-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLVerificationRepository implements VerificationRepository {
  constructor(private db: MySQLConnection) {}

  async create(verification: VerificationCode): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO verification_codes (id, phone, code, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        verification.id,
        verification.phone,
        verification.code,
        verification.expiresAt.getTime(),
        verification.createdAt.getTime(),
      ]
    );
  }

  async getLatestByPhone(phone: string): Promise<VerificationCode | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM verification_codes WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
      [phone]
    );
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      phone: row.phone,
      code: row.code,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    };
  }

  async deleteByPhone(phone: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM verification_codes WHERE phone = ?', [phone]);
  }
}
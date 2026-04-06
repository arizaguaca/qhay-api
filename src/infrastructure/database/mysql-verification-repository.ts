import { VerificationCode } from '../../domain/entities/verification-code';
import { VerificationRepository } from '../../domain/repositories/verification-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLVerificationRepository implements VerificationRepository {
  constructor(private db: MySQLConnection) {}

  async create(verification: VerificationCode): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO verification_codes (id, entity_id, contact, channel, code, verified, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        verification.id,
        verification.entityId,
        verification.contact,
        verification.channel,
        verification.code,
        verification.verified,
        this.formatDate(verification.expiresAt),
        this.formatDate(verification.createdAt),
        this.formatDate(verification.updatedAt),
      ]
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }


  async getLatestByContact(contact: string): Promise<VerificationCode | null> {
    const conn = this.db.getConnection();
    const [rows] = (await conn.execute(
      'SELECT * FROM verification_codes WHERE contact = ? ORDER BY created_at DESC LIMIT 1',
      [contact]
    )) as [any[], any];

    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      entityId: row.entity_id,
      contact: row.contact,
      channel: row.channel,
      code: row.code,
      verified: row.verified === 1,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async deleteByContact(contact: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM verification_codes WHERE contact = ?', [contact]);
  }
}
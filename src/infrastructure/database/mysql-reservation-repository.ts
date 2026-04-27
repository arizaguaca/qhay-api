import { Reservation } from '../../domain/entities/reservation';
import { ReservationRepository } from '../../domain/repositories/reservation-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLReservationRepository implements ReservationRepository {
  constructor(private db: MySQLConnection) {}

  async create(reservation: Reservation): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO reservations (id, customer_id, restaurant_id, table_number, reservation_date, guests, status, cancelled_by, cancellation_reason, cancelled_by_user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservation.id,
        reservation.customerId,
        reservation.restaurantId,
        reservation.tableNumber,
        toMySqlDateTime(reservation.reservationDate),
        reservation.guests,
        reservation.status,
        reservation.cancelledBy ?? null,
        reservation.cancellationReason ?? null,
        reservation.cancelledByUserId ?? null,
        toMySqlDateTime(reservation.createdAt),
        toMySqlDateTime(reservation.updatedAt),
      ]
    );
  }

  async getById(id: string): Promise<Reservation | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM reservations WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    return {
      id: row.id,
      customerId: row.customer_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      cancelledBy: row.cancelled_by ?? null,
      cancellationReason: row.cancellation_reason ?? null,
      cancelledByUserId: row.cancelled_by_user_id ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async fetchByRestaurantId(restaurantId: string): Promise<Reservation[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM reservations WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      customerId: row.customer_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      cancelledBy: row.cancelled_by ?? null,
      cancellationReason: row.cancellation_reason ?? null,
      cancelledByUserId: row.cancelled_by_user_id ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async fetchByCustomerId(customerId: string): Promise<Reservation[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM reservations WHERE customer_id = ?', [customerId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      customerId: row.customer_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      cancelledBy: row.cancelled_by ?? null,
      cancellationReason: row.cancellation_reason ?? null,
      cancelledByUserId: row.cancelled_by_user_id ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?', [status, toMySqlDateTime(new Date()), id]);
  }

  async update(reservation: Reservation): Promise<void> {
    const conn = this.db.getConnection();
    reservation.updatedAt = new Date();
    await conn.execute(
      'UPDATE reservations SET table_number = ?, reservation_date = ?, guests = ?, status = ?, cancelled_by = ?, cancellation_reason = ?, cancelled_by_user_id = ?, updated_at = ? WHERE id = ?',
      [
        reservation.tableNumber,
        toMySqlDateTime(reservation.reservationDate),
        reservation.guests,
        reservation.status,
        reservation.cancelledBy ?? null,
        reservation.cancellationReason ?? null,
        reservation.cancelledByUserId ?? null,
        toMySqlDateTime(reservation.updatedAt),
        reservation.id,
      ]
    );
  }
}
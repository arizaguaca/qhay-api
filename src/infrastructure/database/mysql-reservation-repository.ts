import { Reservation } from '../../domain/entities/reservation';
import { ReservationRepository } from '../../domain/repositories/reservation-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLReservationRepository implements ReservationRepository {
  constructor(private db: MySQLConnection) {}

  async create(reservation: Reservation): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO reservations (id, user_id, restaurant_id, table_number, reservation_date, guests, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservation.id,
        reservation.userId,
        reservation.restaurantId,
        reservation.tableNumber,
        reservation.reservationDate.getTime(),
        reservation.guests,
        reservation.status,
        reservation.createdAt.getTime(),
        reservation.updatedAt.getTime(),
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
      userId: row.user_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async fetchByRestaurantId(restaurantId: string): Promise<Reservation[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM reservations WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async fetchByUserId(userId: string): Promise<Reservation[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM reservations WHERE user_id = ?', [userId]);
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      reservationDate: new Date(row.reservation_date),
      guests: row.guests,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?', [status, Date.now(), id]);
  }

  async update(reservation: Reservation): Promise<void> {
    const conn = this.db.getConnection();
    reservation.updatedAt = new Date();
    await conn.execute(
      'UPDATE reservations SET table_number = ?, reservation_date = ?, guests = ?, status = ?, updated_at = ? WHERE id = ?',
      [
        reservation.tableNumber,
        reservation.reservationDate.getTime(),
        reservation.guests,
        reservation.status,
        reservation.updatedAt.getTime(),
        reservation.id,
      ]
    );
  }
}
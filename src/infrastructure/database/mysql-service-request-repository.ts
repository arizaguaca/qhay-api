import { ServiceRequest } from '../../domain/entities/service-request';
import { ServiceRequestRepository } from '../../domain/repositories/service-request-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLServiceRequestRepository implements ServiceRequestRepository {
  constructor(private db: MySQLConnection) {}

  private mapRow(row: any): ServiceRequest {
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      tableNumber: row.table_number,
      customerId: row.customer_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(request: ServiceRequest): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      `INSERT INTO service_requests (id, restaurant_id, table_number, customer_id, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        request.id,
        request.restaurantId,
        request.tableNumber,
        request.customerId || null,
        request.status,
      ]
    );
  }

  async updateStatus(id: string, status: 'pending' | 'resolved'): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      `UPDATE service_requests SET status = ? WHERE id = ?`,
      [status, id]
    );
  }

  async getByRestaurantId(restaurantId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]> {
    const conn = this.db.getConnection();
    let query = `SELECT * FROM service_requests WHERE restaurant_id = ?`;
    const params: any[] = [restaurantId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await conn.execute(query, params);
    return (rows as any[]).map(this.mapRow);
  }

  async getByCustomerId(customerId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]> {
    const conn = this.db.getConnection();
    let query = `SELECT * FROM service_requests WHERE customer_id = ?`;
    const params: any[] = [customerId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await conn.execute(query, params);
    return (rows as any[]).map(this.mapRow);
  }
}

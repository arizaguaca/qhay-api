import { OrderReview } from '../../domain/entities/order-review';
import { OrderReviewRepository } from '../../domain/repositories/order-review-repository';
import { MySQLConnection } from './mysql-connection';

function toMySqlDateTime(value: Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class MySQLOrderReviewRepository implements OrderReviewRepository {
  constructor(private db: MySQLConnection) {}

  async create(review: OrderReview): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO order_reviews (id, order_id, restaurant_id, customer_id, overall_rating, comment, wants_contact, contact_status, resolution_comment, service_rating, food_rating, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        review.id,
        review.orderId,
        review.restaurantId,
        review.customerId,
        review.overallRating,
        review.comment ?? null,
        review.wantsContact ? 1 : 0,
        review.contactStatus ?? 'not_required',
        review.resolutionComment ?? null,
        review.serviceRating ?? null,
        review.foodRating ?? null,
        toMySqlDateTime(review.createdAt),
        toMySqlDateTime(review.updatedAt),
      ]
    );
  }

  async getByOrderId(orderId: string): Promise<OrderReview | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM order_reviews WHERE order_id = ?', [orderId]);
    if ((rows as any[]).length === 0) return null;
    return this.mapRow((rows as any[])[0]);
  }

  async fetchByRestaurantId(restaurantId: string): Promise<OrderReview[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM order_reviews WHERE restaurant_id = ?', [restaurantId]);
    return (rows as any[]).map(row => this.mapRow(row));
  }

  async fetchByCustomerId(customerId: string): Promise<OrderReview[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM order_reviews WHERE customer_id = ?', [customerId]);
    return (rows as any[]).map(row => this.mapRow(row));
  }

  private mapRow(row: any): OrderReview {
    return {
      id: row.id,
      orderId: row.order_id,
      restaurantId: row.restaurant_id,
      customerId: row.customer_id,
      overallRating: row.overall_rating,
      comment: row.comment ?? null,
      wantsContact: row.wants_contact === 1,
      contactStatus: row.contact_status,
      resolutionComment: row.resolution_comment ?? null,
      serviceRating: row.service_rating ?? null,
      foodRating: row.food_rating ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

import { OrderReview } from '../entities/order-review';

export interface OrderReviewRepository {
  create(review: OrderReview): Promise<void>;
  getByOrderId(orderId: string): Promise<OrderReview | null>;
  fetchByRestaurantId(restaurantId: string): Promise<OrderReview[]>;
  fetchByCustomerId(customerId: string): Promise<OrderReview[]>;
}

import { Order } from '../entities/order';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  getById(id: string): Promise<Order | null>;
  fetchByRestaurantId(restaurantId: string): Promise<Order[]>;
  fetchByCustomerId(customerId: string): Promise<Order[]>;
  updateStatus(id: string, status: string): Promise<void>;
  update(order: Order): Promise<void>;
}
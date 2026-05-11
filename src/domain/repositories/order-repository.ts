import { Order } from '../entities/order';

export interface OrderRepository {
  create(order: Order): Promise<void>;
  getById(id: string): Promise<Order | null>;
  fetchByRestaurantId(restaurantId: string, statuses?: string[]): Promise<Order[]>;
  fetchByCustomerId(customerId: string): Promise<Order[]>;
  fetchByTableAndRestaurant(restaurantId: string, tableNumber: number, statuses?: string[]): Promise<Order[]>;
  updateStatus(id: string, status: string): Promise<void>;
  updateCustomerAndOrigin(id: string, customerId: string, originCustomerId: string): Promise<void>;
  update(order: Order): Promise<void>;
}
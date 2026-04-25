import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../domain/entities/order';
import { OrderRepository } from '../../domain/repositories/order-repository';

export class OrderUseCaseImpl {
  constructor(private orderRepo: OrderRepository) {}

  async create(order: Order): Promise<void> {
    if (!order.id) {
      order.id = uuidv4();
    }
    order.createdAt = new Date();
    order.updatedAt = new Date();

    // Calculate total price if not provided
    if (!order.totalPrice) {
      order.totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    await this.orderRepo.create(order);
  }

  async getById(id: string): Promise<Order | null> {
    return await this.orderRepo.getById(id);
  }

  async getByRestaurantId(restaurantId: string): Promise<Order[]> {
    return await this.orderRepo.fetchByRestaurantId(restaurantId);
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    return await this.orderRepo.fetchByCustomerId(customerId);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
    }
    await this.orderRepo.updateStatus(id, status);
  }
}
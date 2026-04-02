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
}
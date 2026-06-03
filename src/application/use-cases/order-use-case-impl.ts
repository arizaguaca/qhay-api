import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../domain/entities/order';
import { OrderRepository } from '../../domain/repositories/order-repository';
import { OrderStatusHistoryRepository } from '../../domain/repositories/order-status-history-repository';
import { SocketEmitter } from '../../infrastructure/socket/socket-emitter';

export class OrderUseCaseImpl {
  constructor(
    private orderRepo: OrderRepository,
    private historyRepo: OrderStatusHistoryRepository
  ) {}

  async create(order: Order): Promise<Order> {
    if (!order.id) {
      order.id = uuidv4();
    }
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.status = order.status || 'pending';

    // Calculate total amount if not provided
    if (!order.totalAmount) {
      order.totalAmount = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }

    await this.orderRepo.create(order);

    // Record initial status in history
    await this.historyRepo.create({
      id: uuidv4(),
      orderId: order.id,
      status: order.status,
      changedAt: new Date(),
      changedByUserId: null, // Initial creation usually doesn't have a staff user
    });

    const fullOrder = await this.orderRepo.getById(order.id);

    // Notify via Socket
    if (order.status === 'pending' && fullOrder) {
      SocketEmitter.notifyNewOrder(order.restaurantId, fullOrder);
    }

    return fullOrder || order;
  }

  async getById(id: string): Promise<Order | null> {
    return await this.orderRepo.getById(id);
  }

  async getByRestaurantId(restaurantId: string, statuses?: string[]): Promise<Order[]> {
    return await this.orderRepo.fetchByRestaurantId(restaurantId, statuses);
  }

  async getByCustomerId(customerId: string): Promise<Order[]> {
    return await this.orderRepo.fetchByCustomerId(customerId);
  }

  async getByTableAndRestaurant(restaurantId: string, tableNumber: number): Promise<Order[]> {
    const activeStatuses = ['pending', 'preparing', 'ready', 'delivered'];
    return await this.orderRepo.fetchByTableAndRestaurant(restaurantId, tableNumber, activeStatuses);
  }

  async requestTablePayment(restaurantId: string, tableNumber: number, payingCustomerId: string): Promise<{ updatedCount: number }> {
    const readyOrders = await this.orderRepo.fetchByTableAndRestaurant(restaurantId, tableNumber, ['delivered']);

    if (readyOrders.length === 0) {
      return { updatedCount: 0 };
    }

    for (const order of readyOrders) {
      if (order.customerId !== payingCustomerId) {
        await this.orderRepo.updateCustomerAndOrigin(order.id, payingCustomerId, order.customerId);
      }
      await this.orderRepo.updateStatus(order.id, 'payment_requested');
      await this.historyRepo.create({
        id: uuidv4(),
        orderId: order.id,
        status: 'payment_requested',
        changedAt: new Date(),
        changedByUserId: null,
      });

      const updatedOrder = await this.orderRepo.getById(order.id);
      if (updatedOrder) {
        SocketEmitter.notifyOrderStatusUpdate(order.customerId, order.id, 'payment_requested');
      }
    }

    return { updatedCount: readyOrders.length };
  }

  async updateStatus(id: string, status: string, changedByUserId?: string | null): Promise<void> {
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'payment_requested', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
    }

    await this.orderRepo.updateStatus(id, status);

    // Record status change in history
    await this.historyRepo.create({
      id: uuidv4(),
      orderId: id,
      status: status,
      changedAt: new Date(),
      changedByUserId: changedByUserId || null,
    });

    // Notify status update
    const order = await this.orderRepo.getById(id);
    if (order) {
       SocketEmitter.notifyOrderStatusUpdate(order.customerId, id, status);
    }
  }

  async getMetricsByRestaurantId(restaurantId: string): Promise<any> {
    return await this.orderRepo.fetchMetricsByRestaurantId(restaurantId);
  }
}
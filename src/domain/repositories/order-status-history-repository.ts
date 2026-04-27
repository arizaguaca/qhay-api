import { OrderStatusHistory } from '../entities/order-status-history';

export interface OrderStatusHistoryRepository {
  create(entry: OrderStatusHistory): Promise<void>;
  fetchByOrderId(orderId: string): Promise<OrderStatusHistory[]>;
}

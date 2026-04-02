import { Order } from '../../domain/entities/order';

export interface OrderUseCase {
  create(order: Order): Promise<void>;
  getById(id: string): Promise<Order | null>;
}
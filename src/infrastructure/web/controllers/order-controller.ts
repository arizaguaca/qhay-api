import { Request, Response } from 'express';
import { OrderUseCaseImpl } from '../../../application/use-cases/order-use-case-impl';

export class OrderController {
  constructor(private orderUseCase: OrderUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = req.body;
      await this.orderUseCase.create(order);
      res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderUseCase.getById(id);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetch(req: Request, res: Response): Promise<void> {
    try {
      const { restaurant_id, customer_id } = req.query;
      let orders: any[] = [];

      if (restaurant_id) {
        orders = await this.orderUseCase.getByRestaurantId(restaurant_id as string);
      } else if (customer_id) {
        orders = await this.orderUseCase.getByCustomerId(customer_id as string);
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }
      await this.orderUseCase.updateStatus(id, status);
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
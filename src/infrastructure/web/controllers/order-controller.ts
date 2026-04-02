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
}
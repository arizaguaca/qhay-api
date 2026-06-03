import { Request, Response } from 'express';
import { OrderUseCaseImpl } from '../../../application/use-cases/order-use-case-impl';

export class OrderController {
  constructor(private orderUseCase: OrderUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const order = req.body;
      const createdOrder = await this.orderUseCase.create(order);
      res.status(201).json(createdOrder);
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
      const { restaurant_id, customer_id, statuses } = req.query;
      let orders: any[] = [];

      if (restaurant_id) {
        const statusArray = statuses ? (statuses as string).split(',') : undefined;
        orders = await this.orderUseCase.getByRestaurantId(restaurant_id as string, statusArray);
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
      const { status, userId } = req.body;
      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }
      await this.orderUseCase.updateStatus(id, status, userId);
      res.json({ message: 'Order status updated successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async requestTablePayment(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, tableNumber } = req.params;
      const { customer_id } = req.body;
      if (!customer_id) {
        res.status(400).json({ error: 'customer_id is required' });
        return;
      }
      const result = await this.orderUseCase.requestTablePayment(restaurantId, Number(tableNumber), customer_id);
      res.json({ message: 'Payment requested successfully', updatedCount: result.updatedCount });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getByTable(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, tableNumber } = req.params;
      const orders = await this.orderUseCase.getByTableAndRestaurant(restaurantId, Number(tableNumber));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // New endpoint: fetch orders for a specific customer (public menu)
  async getByCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const orders = await this.orderUseCase.getByCustomerId(customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const metrics = await this.orderUseCase.getMetricsByRestaurantId(restaurantId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
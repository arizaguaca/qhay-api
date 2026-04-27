import { Request, Response } from 'express';
import { OrderReviewUseCaseImpl } from '../../../application/use-cases/order-review-use-case-impl';

export class OrderReviewController {
  constructor(private orderReviewUseCase: OrderReviewUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const review = req.body;
      await this.orderReviewUseCase.create(review);
      res.status(201).json({ message: 'Review created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const review = await this.orderReviewUseCase.getByOrderId(orderId);
      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const reviews = await this.orderReviewUseCase.fetchByRestaurantId(restaurantId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const reviews = await this.orderReviewUseCase.fetchByCustomerId(customerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

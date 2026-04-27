import { Request, Response } from 'express';
import { CustomerFavoriteUseCaseImpl } from '../../../application/use-cases/customer-favorite-use-case-impl';

export class CustomerFavoriteController {
  constructor(private favoriteUseCase: CustomerFavoriteUseCaseImpl) {}

  async toggle(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, menuItemId } = req.body;
      if (!customerId || !menuItemId) {
        res.status(400).json({ error: 'customerId and menuItemId are required' });
        return;
      }
      const result = await this.favoriteUseCase.toggle(customerId, menuItemId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const favorites = await this.favoriteUseCase.fetchByCustomerId(customerId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

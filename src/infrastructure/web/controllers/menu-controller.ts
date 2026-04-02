import { Request, Response } from 'express';
import { MenuUseCaseImpl } from '../../../application/use-cases/menu-use-case-impl';

export class MenuController {
  constructor(private menuUseCase: MenuUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const item = req.body;
      await this.menuUseCase.create(item);
      res.status(201).json({ message: 'Menu item created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.menuUseCase.getById(id);
      if (!item) {
        res.status(404).json({ error: 'Menu item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const items = await this.menuUseCase.fetchByRestaurantId(restaurantId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const item = req.body;
      await this.menuUseCase.update(item);
      res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.menuUseCase.delete(id);
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
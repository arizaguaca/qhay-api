import path from 'path';
import { Request, Response } from 'express';
import { RestaurantUseCaseImpl } from '../../../application/use-cases/restaurant-use-case-impl';

export class RestaurantController {
  constructor(private restaurantUseCase: RestaurantUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const restaurant = req.body;

      // Si se subió un logo, construye la ruta relativa para guardar en BD
      if (req.file) {
        const relativePath = path.join('uploads', 'logos', req.file.filename).replace(/\\/g, '/');
        restaurant.logoUrl = relativePath;
      } else {
        restaurant.logoUrl = restaurant.logoUrl ?? '';
      }

      await this.restaurantUseCase.create(restaurant);
      res.status(201).json({ message: 'Restaurant created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await this.restaurantUseCase.getById(id);
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetch(req: Request, res: Response): Promise<void> {
    try {
      const restaurants = await this.restaurantUseCase.fetch();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByOwnerId(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const restaurants = await this.restaurantUseCase.getByOwnerId(ownerId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = req.body;
      restaurant.id = id;

      // Si se subió un logo durante la actualización
      if (req.file) {
        const relativePath = path.join('uploads', 'logos', req.file.filename).replace(/\\/g, '/');
        restaurant.logoUrl = relativePath;
      }

      await this.restaurantUseCase.update(restaurant);
      res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
import { Request, Response } from 'express';
import { CuisineTypeUseCase } from '../../../application/use-cases/cuisine-type-use-case';

export class CuisineTypeController {
  constructor(private cuisineTypeUseCase: CuisineTypeUseCase) {}

  async fetchAll(req: Request, res: Response): Promise<void> {
    try {
      const cuisineTypes = await this.cuisineTypeUseCase.fetchAll();
      res.json(cuisineTypes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const cuisineTypes = await this.cuisineTypeUseCase.fetchByOwnerId(ownerId);
      res.json(cuisineTypes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
      }
      const cuisineType = await this.cuisineTypeUseCase.create({ name, userId });
      res.status(201).json(cuisineType);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.cuisineTypeUseCase.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

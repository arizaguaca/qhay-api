import { Request, Response } from 'express';
import { CityUseCase } from '../../../application/use-cases/city-use-case';

export class CityController {
  constructor(private cityUseCase: CityUseCase) {}

  async fetchAll(req: Request, res: Response): Promise<void> {
    try {
      const cities = await this.cityUseCase.fetchAll();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

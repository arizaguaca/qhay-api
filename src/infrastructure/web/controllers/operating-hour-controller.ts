import { Request, Response } from 'express';
import { OperatingHourUseCaseImpl } from '../../../application/use-cases/operating-hour-use-case-impl';

export class OperatingHourController {
  constructor(private operatingHourUseCase: OperatingHourUseCaseImpl) {}

  async saveHours(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const hours = req.body;
      await this.operatingHourUseCase.saveHours(restaurantId, hours);
      res.status(201).json({ message: 'Operating hours saved successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const hours = await this.operatingHourUseCase.getByRestaurantId(restaurantId);
      res.json(hours);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
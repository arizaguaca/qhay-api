import { Request, Response } from 'express';
import { OperatingHourUseCaseImpl } from '../../../application/use-cases/operating-hour-use-case-impl';
import { OperatingHour } from '../../../domain/entities/operating-hour';

export class OperatingHourController {
  constructor(private operatingHourUseCase: OperatingHourUseCaseImpl) {}

  async saveHours(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const rawHours = req.body;

      if (!Array.isArray(rawHours)) {
        res.status(400).json({ error: 'Body must be an array of operating hours' });
        return;
      }

      // Mapear de snake_case (frontend) a camelCase (dominio)
      const hours: OperatingHour[] = rawHours.map((h: any) => ({
        id: h.id,
        restaurantId: h.restaurant_id || restaurantId,
        dayOfWeek: h.day_of_week !== undefined ? h.day_of_week : h.dayOfWeek,
        openTime: h.open_time || h.openTime,
        closeTime: h.close_time || h.closeTime,
        isClosed: h.is_closed !== undefined ? h.is_closed : h.isClosed,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

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
      
      // Mapear de camelCase a snake_case para la respuesta (opcional pero recomendado para consistencia)
      const response = hours.map(h => ({
        id: h.id,
        restaurant_id: h.restaurantId,
        day_of_week: h.dayOfWeek,
        open_time: h.openTime,
        close_time: h.closeTime,
        is_closed: h.isClosed,
        created_at: h.createdAt,
        updated_at: h.updatedAt
      }));

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
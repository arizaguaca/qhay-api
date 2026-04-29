import { v4 as uuidv4 } from 'uuid';
import { OperatingHour } from '../../domain/entities/operating-hour';
import { OperatingHourRepository } from '../../domain/repositories/operating-hour-repository';

export class OperatingHourUseCaseImpl {
  constructor(private operatingHourRepo: OperatingHourRepository) {}

  async saveHours(restaurantId: string, hours: OperatingHour[]): Promise<void> {
    for (const hour of hours) {
      // Intentar buscar si ya existe el horario para ese día
      const existing = await this.operatingHourRepo.getByRestaurantAndDay(restaurantId, hour.dayOfWeek);

      if (existing) {
        // Si existe, actualizamos
        const updatedHour: OperatingHour = {
          ...existing,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
          updatedAt: new Date(),
        };
        await this.operatingHourRepo.update(updatedHour);
      } else {
        // Si no existe, creamos uno nuevo
        const newHour: OperatingHour = {
          id: uuidv4(),
          restaurantId,
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await this.operatingHourRepo.create(newHour);
      }
    }
  }

  async getByRestaurantId(restaurantId: string): Promise<OperatingHour[]> {
    return await this.operatingHourRepo.getByRestaurantId(restaurantId);
  }
}
import { v4 as uuidv4 } from 'uuid';
import { OperatingHour } from '../../domain/entities/operating-hour';
import { OperatingHourRepository } from '../../domain/repositories/operating-hour-repository';

export class OperatingHourUseCaseImpl {
  constructor(private operatingHourRepo: OperatingHourRepository) {}

  async saveHours(restaurantId: string, hours: OperatingHour[]): Promise<void> {
    for (const hour of hours) {
      if (!hour.id) {
        hour.id = uuidv4();
      }
      hour.restaurantId = restaurantId;
      hour.createdAt = new Date();
      hour.updatedAt = new Date();
      await this.operatingHourRepo.create(hour);
    }
  }

  async getByRestaurantId(restaurantId: string): Promise<OperatingHour[]> {
    return await this.operatingHourRepo.getByRestaurantId(restaurantId);
  }
}
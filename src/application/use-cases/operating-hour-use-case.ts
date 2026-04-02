import { OperatingHour } from '../../domain/entities/operating-hour';

export interface OperatingHourUseCase {
  saveHours(restaurantId: string, hours: OperatingHour[]): Promise<void>;
  getByRestaurantId(restaurantId: string): Promise<OperatingHour[]>;
}
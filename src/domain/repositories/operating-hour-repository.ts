import { OperatingHour } from '../entities/operating-hour';

export interface OperatingHourRepository {
  create(hour: OperatingHour): Promise<void>;
  update(hour: OperatingHour): Promise<void>;
  getByRestaurantId(restaurantId: string): Promise<OperatingHour[]>;
  getByRestaurantAndDay(restaurantId: string, day: number): Promise<OperatingHour | null>;
  delete(id: string): Promise<void>;
}
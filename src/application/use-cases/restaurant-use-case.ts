import { Restaurant } from '../../domain/entities/restaurant';

export interface RestaurantUseCase {
  create(restaurant: Restaurant): Promise<void>;
  getById(id: string): Promise<Restaurant | null>;
  fetch(): Promise<Restaurant[]>;
  getByOwnerId(ownerId: string): Promise<Restaurant[]>;
  update(restaurant: Restaurant): Promise<void>;
}
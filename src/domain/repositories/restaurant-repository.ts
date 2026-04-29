import { Restaurant } from '../entities/restaurant';

export interface RestaurantRepository {
  create(restaurant: Restaurant): Promise<void>;
  getById(id: string): Promise<Restaurant | null>;
  fetch(): Promise<Restaurant[]>;
  getByOwnerId(ownerId: string): Promise<Restaurant[]>;
  update(restaurant: Restaurant): Promise<void>;
  delete(id: string): Promise<void>;
}
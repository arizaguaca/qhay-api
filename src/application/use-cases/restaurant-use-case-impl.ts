import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../../domain/entities/restaurant';
import { RestaurantRepository } from '../../domain/repositories/restaurant-repository';

export class RestaurantUseCaseImpl {
  constructor(private restaurantRepo: RestaurantRepository) {}

  async create(restaurant: Restaurant): Promise<void> {
    if (!restaurant.id) {
      restaurant.id = uuidv4();
    }
    restaurant.createdAt = new Date();
    restaurant.updatedAt = new Date();

    await this.restaurantRepo.create(restaurant);
  }

  async getById(id: string): Promise<Restaurant | null> {
    return await this.restaurantRepo.getById(id);
  }

  async fetch(): Promise<Restaurant[]> {
    return await this.restaurantRepo.fetch();
  }

  async getByOwnerId(ownerId: string): Promise<Restaurant[]> {
    return await this.restaurantRepo.getByOwnerId(ownerId);
  }

  async update(restaurant: Restaurant): Promise<void> {
    restaurant.updatedAt = new Date();
    await this.restaurantRepo.update(restaurant);
  }
}
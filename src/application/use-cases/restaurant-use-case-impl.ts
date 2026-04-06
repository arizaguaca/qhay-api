import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../../domain/entities/restaurant';
import { RestaurantRepository } from '../../domain/repositories/restaurant-repository';

export class RestaurantUseCaseImpl {
  constructor(private restaurantRepo: RestaurantRepository) {}

  async create(restaurant: Restaurant): Promise<void> {
    if (!restaurant.phone?.trim()) {
      throw new Error('phone is required');
    }
    if (!restaurant.locationType?.trim()) {
      throw new Error('locationType is required');
    }
    if (!restaurant.cuisineType?.trim()) {
      throw new Error('cuisineType is required');
    }
    if (restaurant.locationType === 'Food Court' && !restaurant.mallName?.trim()) {
      throw new Error('mallName is required when locationType is Food Court');
    }
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
    const existing = await this.restaurantRepo.getById(restaurant.id);
    if (!existing) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.phone !== undefined && !restaurant.phone.trim()) {
      throw new Error('phone is required');
    }
    if (restaurant.locationType !== undefined && !restaurant.locationType.trim()) {
      throw new Error('locationType is required');
    }
    if (restaurant.cuisineType !== undefined && !restaurant.cuisineType.trim()) {
      throw new Error('cuisineType is required');
    }

    // Validación condicional para Food Court
    const finalLocationType = restaurant.locationType ?? existing.locationType;
    const finalMallName = restaurant.mallName ?? existing.mallName;
    if (finalLocationType === 'Food Court' && (!finalMallName || !finalMallName.trim())) {
      throw new Error('mallName is required when locationType is Food Court');
    }

    // Merge only specified fields, preserve createdAt
    const updatedRestaurant: Restaurant = {
      ...existing,
      ...restaurant,
      updatedAt: new Date(),
      createdAt: existing.createdAt, // Ensure it's not changed
    };

    // Si el logoUrl ha cambiado y existía uno anterior, eliminamos el archivo antiguo
    if (restaurant.logoUrl && existing.logoUrl && restaurant.logoUrl !== existing.logoUrl) {
      const oldPath = path.join(process.cwd(), existing.logoUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error(`Error deleting old logo file: ${oldPath}`, err);
        }
      }
    }

    await this.restaurantRepo.update(updatedRestaurant);
  }
}
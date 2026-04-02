import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../../domain/entities/menu-item';
import { MenuRepository } from '../../domain/repositories/menu-repository';

export class MenuUseCaseImpl {
  constructor(private menuRepo: MenuRepository) {}

  async create(item: MenuItem): Promise<void> {
    if (!item.id) {
      item.id = uuidv4();
    }
    item.createdAt = new Date();
    item.updatedAt = new Date();

    await this.menuRepo.create(item);
  }

  async getById(id: string): Promise<MenuItem | null> {
    return await this.menuRepo.getById(id);
  }

  async fetchByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return await this.menuRepo.fetchByRestaurantId(restaurantId);
  }

  async update(item: MenuItem): Promise<void> {
    item.updatedAt = new Date();
    await this.menuRepo.update(item);
  }

  async delete(id: string): Promise<void> {
    await this.menuRepo.delete(id);
  }
}
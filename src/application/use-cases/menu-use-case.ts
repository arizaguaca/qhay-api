import { MenuItem } from '../../domain/entities/menu-item';

export interface MenuUseCase {
  create(item: MenuItem): Promise<void>;
  getById(id: string): Promise<MenuItem | null>;
  fetchByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
  update(item: MenuItem): Promise<void>;
  delete(id: string): Promise<void>;
}
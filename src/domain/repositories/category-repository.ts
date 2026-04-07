import { Category } from '../entities/category';

export interface CategoryRepository {
  create(category: Category): Promise<void>;
  fetchByRestaurantId(restaurantId: string): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  delete(id: string): Promise<void>;
}

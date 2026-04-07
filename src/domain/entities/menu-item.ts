import { Category } from './category';
import { ModifierGroup } from './modifier';

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  prepTime?: number;
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  groups?: ModifierGroup[];
  category?: Category;
}
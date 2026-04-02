export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  prepTime: number; // in minutes
  imageUrl: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
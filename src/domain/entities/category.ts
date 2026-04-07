export interface Category {
  id: string;
  restaurantId?: string | null;
  name: string;
  isCustom: boolean;
}

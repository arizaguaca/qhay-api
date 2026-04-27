export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  locationType: string;
  cuisineId: string;
  cityId: string;
  mallId?: string | null;
  link?: string | null;
  userId: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
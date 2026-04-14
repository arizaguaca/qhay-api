export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  locationType: string;
  cuisineType: string;
  mallId?: string | null;
  link?: string | null;
  ownerId: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
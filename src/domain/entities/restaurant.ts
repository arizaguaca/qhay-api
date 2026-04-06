export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  locationType: string;
  cuisineType: string;
  mallName?: string | null;
  link?: string | null;
  ownerId: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
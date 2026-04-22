import { CuisineType } from '../entities/cuisine-type';

export interface CuisineTypeRepository {
  create(cuisineType: CuisineType): Promise<void>;
  fetchAll(): Promise<CuisineType[]>;
  fetchByOwnerId(ownerId: string): Promise<CuisineType[]>;
  getById(id: string): Promise<CuisineType | null>;
  delete(id: string): Promise<void>;
}

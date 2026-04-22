import { City } from '../entities/city';

export interface CityRepository {
  fetchAll(): Promise<City[]>;
  getById(id: string): Promise<City | null>;
}

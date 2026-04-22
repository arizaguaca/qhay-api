import { City } from '../../domain/entities/city';
import { CityRepository } from '../../domain/repositories/city-repository';

export class CityUseCase {
  constructor(private cityRepo: CityRepository) {}

  async fetchAll(): Promise<City[]> {
    return await this.cityRepo.fetchAll();
  }

  async getById(id: string): Promise<City | null> {
    return await this.cityRepo.getById(id);
  }
}

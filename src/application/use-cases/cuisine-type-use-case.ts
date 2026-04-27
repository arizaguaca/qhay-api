import { CuisineType } from '../../domain/entities/cuisine-type';
import { CuisineTypeRepository } from '../../domain/repositories/cuisine-type-repository';
import { v4 as uuidv4 } from 'uuid';

export class CuisineTypeUseCase {
  constructor(private cuisineTypeRepo: CuisineTypeRepository) {}

  async fetchAll(): Promise<CuisineType[]> {
    return await this.cuisineTypeRepo.fetchAll();
  }

  async fetchByOwnerId(ownerId: string): Promise<CuisineType[]> {
    return await this.cuisineTypeRepo.fetchByOwnerId(ownerId);
  }

  async create(data: { name: string; userId?: string }): Promise<CuisineType> {
    const cuisineType: CuisineType = {
      id: uuidv4(),
      name: data.name,
      userId: data.userId,
      isCustom: data.userId ? true : false,
    };
    await this.cuisineTypeRepo.create(cuisineType);
    return cuisineType;
  }

  async delete(id: string): Promise<void> {
    await this.cuisineTypeRepo.delete(id);
  }
}

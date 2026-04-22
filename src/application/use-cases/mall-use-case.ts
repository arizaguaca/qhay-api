import { Mall } from '../../domain/entities/mall';
import { MallRepository } from '../../domain/repositories/mall-repository';

export class MallUseCase {
  constructor(private mallRepo: MallRepository) { }

  async fetch(): Promise<Mall[]> {
    return await this.mallRepo.fetch();
  }

  async fetchByCity(cityId: string): Promise<Mall[]> {
    return await this.mallRepo.fetchByCity(cityId);
  }
}

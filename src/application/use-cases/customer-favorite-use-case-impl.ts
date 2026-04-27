import { v4 as uuidv4 } from 'uuid';
import { CustomerFavorite } from '../../domain/entities/customer-favorite';
import { CustomerFavoriteRepository } from '../../domain/repositories/customer-favorite-repository';

export class CustomerFavoriteUseCaseImpl {
  constructor(private favoriteRepo: CustomerFavoriteRepository) {}

  async toggle(customerId: string, menuItemId: string): Promise<{ added: boolean }> {
    const existing = await this.favoriteRepo.getByCustomerAndItem(customerId, menuItemId);
    if (existing) {
      await this.favoriteRepo.delete(existing.id);
      return { added: false };
    }
    const favorite: CustomerFavorite = {
      id: uuidv4(),
      customerId,
      menuItemId,
      createdAt: new Date(),
    };
    await this.favoriteRepo.create(favorite);
    return { added: true };
  }

  async fetchByCustomerId(customerId: string): Promise<CustomerFavorite[]> {
    return await this.favoriteRepo.fetchByCustomerId(customerId);
  }
}

import { CustomerFavorite } from '../entities/customer-favorite';

export interface CustomerFavoriteRepository {
  create(favorite: CustomerFavorite): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByCustomerAndItem(customerId: string, menuItemId: string): Promise<void>;
  fetchByCustomerId(customerId: string): Promise<CustomerFavorite[]>;
  getByCustomerAndItem(customerId: string, menuItemId: string): Promise<CustomerFavorite | null>;
}

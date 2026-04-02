import { User } from '../entities/user';

export interface UserRepository {
  create(user: User): Promise<void>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByPhone(phone: string): Promise<User | null>;
  getStaffByRestaurant(restaurantId: string): Promise<User[]>;
  fetch(): Promise<User[]>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
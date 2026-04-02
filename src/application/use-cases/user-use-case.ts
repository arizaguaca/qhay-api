import { User } from '../../domain/entities/user';

export interface UserUseCase {
  create(user: User): Promise<void>;
  login(email: string, password: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  getByPhone(phone: string): Promise<User | null>;
  getStaffByRestaurant(restaurantId: string): Promise<User[]>;
  fetch(): Promise<User[]>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
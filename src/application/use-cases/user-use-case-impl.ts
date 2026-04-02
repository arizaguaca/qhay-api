import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User } from '../../domain/entities/user';
import { UserRepository } from '../../domain/repositories/user-repository';

export class UserUseCaseImpl {
  constructor(private userRepo: UserRepository) {}

  async create(user: User): Promise<void> {
    if (!user.id) {
      user.id = uuidv4();
    }
    user.password = await bcrypt.hash(user.password, 10);
    user.createdAt = new Date();
    user.updatedAt = new Date();

    await this.userRepo.create(user);
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.getByEmail(email);
    if (!user) return null;

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password);
    } catch (error) {
      // user.password might be plaintext (from legacy data); fallback below
    }

    if (!isValidPassword) {
      if (password !== user.password) {
        return null;
      }
      // Legacy plaintext password match; upgrade to bcrypt
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
      user.updatedAt = new Date();
      await this.userRepo.update(user);
      isValidPassword = true;
    }

    if (!isValidPassword) return null;

    return user;
  }

  async getById(id: string): Promise<User | null> {
    return await this.userRepo.getById(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.userRepo.getByEmail(email);
  }

  async getByPhone(phone: string): Promise<User | null> {
    return await this.userRepo.getByPhone(phone);
  }

  async getStaffByRestaurant(restaurantId: string): Promise<User[]> {
    return await this.userRepo.getStaffByRestaurant(restaurantId);
  }

  async fetch(): Promise<User[]> {
    return await this.userRepo.fetch();
  }

  async update(user: User): Promise<void> {
    user.updatedAt = new Date();
    await this.userRepo.update(user);
  }

  async delete(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../../domain/entities/menu-item';
import { Category } from '../../domain/entities/category';
import { MenuRepository } from '../../domain/repositories/menu-repository';
import { CategoryRepository } from '../../domain/repositories/category-repository';

export class MenuUseCaseImpl {
  constructor(
    private menuRepo: MenuRepository,
    private categoryRepo: CategoryRepository
  ) {}

  async create(item: MenuItem): Promise<void> {
    if (!item.id) {
      item.id = uuidv4();
    }
    item.createdAt = new Date();
    item.updatedAt = new Date();

    // Si viene una nueva categoría para crear "al vuelo"
    if (item.category) {
      if (!item.category.id) {
        item.category.id = uuidv4();
      }
      await this.createCategory(item.category);
      item.categoryId = item.category.id;
    }

    this.ensureModifierIds(item);

    await this.menuRepo.create(item);
  }

  async getById(id: string): Promise<MenuItem | null> {
    return await this.menuRepo.getById(id);
  }

  async fetchByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return await this.menuRepo.fetchByRestaurantId(restaurantId);
  }

  async update(item: MenuItem): Promise<void> {
    item.updatedAt = new Date();

    // Si viene una nueva categoría para crear durante la actualización
    if (item.category) {
      if (!item.category.id) {
        item.category.id = uuidv4();
      }
      await this.createCategory(item.category);
      item.categoryId = item.category.id;
    }

    this.ensureModifierIds(item);
    await this.menuRepo.update(item);
  }

  async createCategory(category: Category): Promise<Category> {
    if (!category.id) {
      category.id = uuidv4();
    }
    await this.categoryRepo.create(category);
    return category;
  }

  async fetchCategories(restaurantId: string): Promise<Category[]> {
    return await this.categoryRepo.fetchByRestaurantId(restaurantId);
  }

  private ensureModifierIds(item: MenuItem): void {
    if (item.groups) {
      for (const group of item.groups) {
        if (!group.id) group.id = uuidv4();
        if (group.options) {
          for (const option of group.options) {
            if (!option.id) option.id = uuidv4();
            if (!option.groupId) option.groupId = group.id;
          }
        }
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.menuRepo.delete(id);
  }
}
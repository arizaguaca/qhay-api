import { MenuItem } from '../../domain/entities/menu-item';
import { ModifierGroup, ModifierOption } from '../../domain/entities/modifier';
import { MenuRepository } from '../../domain/repositories/menu-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLMenuRepository implements MenuRepository {
  constructor(private db: MySQLConnection) {}

  async create(item: MenuItem): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, prep_time, image_url, is_available, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.restaurantId,
        item.categoryId || null,
        item.name,
        item.description,
        item.price,
        item.prepTime ?? null,
        item.imageUrl ?? null,
        item.isAvailable ? 1 : 0,
        item.createdAt,
        item.updatedAt,
      ]
    );

    if (item.groups && item.groups.length > 0) {
      await this.saveModifiers(item.id, item.groups);
    }
  }

  async getById(id: string): Promise<MenuItem | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    
    const groups = await this.getModifiersByItem(id);

    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: row.price,
      prepTime: row.prep_time,
      imageUrl: row.image_url,
      isAvailable: row.is_available === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      groups,
    };
  }

  async fetchByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurantId]);
    const items: MenuItem[] = (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: row.price,
      prepTime: row.prep_time,
      imageUrl: row.image_url,
      isAvailable: row.is_available === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      groups: [],
    }));

    for (const item of items) {
      item.groups = await this.getModifiersByItem(item.id);
    }
    return items;
  }

  async update(item: MenuItem): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, prep_time = ?, image_url = ?, is_available = ?, updated_at = ? WHERE id = ?',
      [
        item.categoryId || null,
        item.name,
        item.description,
        item.price,
        item.prepTime ?? null,
        item.imageUrl ?? null,
        item.isAvailable ? 1 : 0,
        item.updatedAt,
        item.id,
      ]
    );

    if (item.groups !== undefined) {
      // Solo actualizamos (limpiamos y recreamos) modificadores si el front envió la propiedad groups
      await conn.execute('DELETE FROM modifier_groups WHERE menu_item_id = ?', [item.id]);
      if (item.groups && item.groups.length > 0) {
        await this.saveModifiers(item.id, item.groups);
      }
    }
  }

  private async saveModifiers(itemId: string, groups: ModifierGroup[]): Promise<void> {
    const conn = this.db.getConnection();
    for (const group of groups) {
      await conn.execute(
        'INSERT INTO modifier_groups (id, menu_item_id, title, is_required, min_selectable, max_selectable) VALUES (?, ?, ?, ?, ?, ?)',
        [
          group.id,
          itemId,
          group.title,
          group.isRequired ? 1 : 0,
          group.minSelectable ?? 0,
          group.maxSelectable ?? 1
        ]
      );

      if (group.options) {
        for (const option of group.options) {
          await conn.execute(
            'INSERT INTO modifier_options (id, group_id, name, extra_price, is_available) VALUES (?, ?, ?, ?, ?)',
            [
              option.id,
              group.id,
              option.name,
              option.extraPrice ?? 0.00,
              option.isAvailable !== false ? 1 : 0 // Por defecto disponible
            ]
          );
        }
      }
    }
  }

  private async getModifiersByItem(itemId: string): Promise<ModifierGroup[]> {
    const conn = this.db.getConnection();
    const [gRows] = await conn.execute('SELECT * FROM modifier_groups WHERE menu_item_id = ?', [itemId]);
    const groups: ModifierGroup[] = [];

    for (const gRow of (gRows as any[])) {
      const [oRows] = await conn.execute('SELECT * FROM modifier_options WHERE group_id = ?', [gRow.id]);
      const options: ModifierOption[] = (oRows as any[]).map(oRow => ({
        id: oRow.id,
        groupId: oRow.group_id,
        name: oRow.name,
        extraPrice: oRow.extra_price,
        isAvailable: oRow.is_available === 1,
      }));

      groups.push({
        id: gRow.id,
        menuItemId: gRow.menu_item_id,
        title: gRow.title,
        isRequired: gRow.is_required === 1,
        minSelectable: gRow.min_selectable,
        maxSelectable: gRow.max_selectable,
        options,
      });
    }
    return groups;
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('DELETE FROM menu_items WHERE id = ?', [id]);
  }
}
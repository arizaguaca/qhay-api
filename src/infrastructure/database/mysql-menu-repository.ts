import { MenuItem } from '../../domain/entities/menu-item';
import { ModifierGroup, ModifierOption } from '../../domain/entities/modifier';
import { MenuRepository } from '../../domain/repositories/menu-repository';
import { MySQLConnection } from './mysql-connection';

export class MySQLMenuRepository implements MenuRepository {
  constructor(private db: MySQLConnection) {}

  async create(item: MenuItem): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute(
      'INSERT INTO menu_items (id, restaurant_id, menu_category_id, name, description, price, prep_time, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
      ]
    );

    if (item.groups && item.groups.length > 0) {
      await this.saveModifiers(item.id, item.groups);
    }
  }

  async getById(id: string): Promise<MenuItem | null> {
    const conn = this.db.getConnection();
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE id = ? AND deleted_at IS NULL', [id]);
    if ((rows as any[]).length === 0) return null;
    const row = (rows as any[])[0];
    const groups = await this.getModifiersByItem(id);
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      categoryId: row.menu_category_id,
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
    const [rows] = await conn.execute('SELECT * FROM menu_items WHERE restaurant_id = ? AND deleted_at IS NULL', [restaurantId]);
    const items: MenuItem[] = (rows as any[]).map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      categoryId: row.menu_category_id,
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
    
    // Si imageUrl no viene en el objeto (no se subió archivo nuevo), 
    // mantenemos la que ya existe en la base de datos usando COALESCE
    await conn.execute(
      'UPDATE menu_items SET menu_category_id = ?, name = ?, description = ?, price = ?, prep_time = ?, image_url = COALESCE(?, image_url), is_available = ?, updated_at = ? WHERE id = ?',
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
      const payloadGroupIds = item.groups.map(g => g.id).filter(Boolean);
      
      // 1. Obtener grupos existentes en la BD para este item
      const [dbGroups] = await conn.execute('SELECT id FROM product_groups WHERE menu_item_id = ?', [item.id]);
      const dbGroupIds = (dbGroups as any[]).map(g => g.id);

      // 2. Grupos a eliminar (están en BD pero no en el payload)
      const groupsToDelete = dbGroupIds.filter(id => !payloadGroupIds.includes(id));
      for (const groupId of groupsToDelete) {
        try {
          // Intentar eliminar opciones hijas primero
          await conn.execute('DELETE FROM product_options WHERE product_group_id = ?', [groupId]);
          await conn.execute('DELETE FROM product_groups WHERE id = ?', [groupId]);
        } catch (err) {
          // Si falla por restricción de FK (pedidos antiguos), desactivamos las opciones
          const [dbOptions] = await conn.execute('SELECT id FROM product_options WHERE product_group_id = ?', [groupId]);
          for (const opt of (dbOptions as any[])) {
            await conn.execute('UPDATE product_options SET is_available = 0 WHERE id = ?', [opt.id]);
          }
        }
      }

      // 3. Procesar grupos del payload (Insertar o Actualizar)
      for (const group of item.groups) {
        const isExistingGroup = group.id && dbGroupIds.includes(group.id);
        
        if (isExistingGroup) {
          await conn.execute(
            'UPDATE product_groups SET name = ?, min_selectable = ?, max_selectable = ?, is_required = ? WHERE id = ?',
            [
              group.title || (group as any).name,
              group.minSelectable ?? 0,
              group.maxSelectable ?? 1,
              group.isRequired ? 1 : 0,
              group.id
            ]
          );
        } else {
          await conn.execute(
            'INSERT INTO product_groups (id, menu_item_id, name, min_selectable, max_selectable, is_required) VALUES (?, ?, ?, ?, ?, ?)',
            [
              group.id,
              item.id,
              group.title || (group as any).name,
              group.minSelectable ?? 0,
              group.maxSelectable ?? 1,
              group.isRequired ? 1 : 0
            ]
          );
        }

        // 4. Procesar opciones hijas de este grupo
        const payloadOptionIds = (group.options || []).map(o => o.id).filter(Boolean);
        const [dbOptions] = await conn.execute('SELECT id FROM product_options WHERE product_group_id = ?', [group.id]);
        const dbOptionIds = (dbOptions as any[]).map(o => o.id);

        // Opciones a eliminar
        const optionsToDelete = dbOptionIds.filter(id => !payloadOptionIds.includes(id));
        for (const optId of optionsToDelete) {
          try {
            await conn.execute('DELETE FROM product_options WHERE id = ?', [optId]);
          } catch (err) {
            // Si tiene pedidos asociados, simplemente la marcamos como no disponible
            await conn.execute('UPDATE product_options SET is_available = 0 WHERE id = ?', [optId]);
          }
        }

        // Opciones a Insertar o Actualizar
        if (group.options) {
          for (const option of group.options) {
            const isExistingOption = option.id && dbOptionIds.includes(option.id);
            if (isExistingOption) {
              await conn.execute(
                'UPDATE product_options SET name = ?, extra_price = ?, is_available = ? WHERE id = ?',
                [
                  option.name,
                  option.extraPrice ?? 0.00,
                  option.isAvailable !== false ? 1 : 0,
                  option.id
                ]
              );
            } else {
              await conn.execute(
                'INSERT INTO product_options (id, product_group_id, name, extra_price, is_available) VALUES (?, ?, ?, ?, ?)',
                [
                  option.id,
                  group.id,
                  option.name,
                  option.extraPrice ?? 0.00,
                  option.isAvailable !== false ? 1 : 0
                ]
              );
            }
          }
        }
      }
    }
  }

  private async saveModifiers(itemId: string, groups: ModifierGroup[]): Promise<void> {
    const conn = this.db.getConnection();
    for (const group of groups) {
      await conn.execute(
        'INSERT INTO product_groups (id, menu_item_id, name, min_selectable, max_selectable, is_required) VALUES (?, ?, ?, ?, ?, ?)',
        [
          group.id,
          itemId,
          group.title,
          group.minSelectable ?? 0,
          group.maxSelectable ?? 1,
          group.isRequired ? 1 : 0,
        ]
      );

      if (group.options) {
        for (const option of group.options) {
          await conn.execute(
            'INSERT INTO product_options (id, product_group_id, name, extra_price, is_available) VALUES (?, ?, ?, ?, ?)',
            [
              option.id,
              group.id,
              option.name,
              option.extraPrice ?? 0.00,
              option.isAvailable !== false ? 1 : 0
            ]
          );
        }
      }
    }
  }

  private async getModifiersByItem(itemId: string): Promise<ModifierGroup[]> {
    const conn = this.db.getConnection();
    const [gRows] = await conn.execute('SELECT * FROM product_groups WHERE menu_item_id = ?', [itemId]);
    const groups: ModifierGroup[] = [];

    for (const gRow of (gRows as any[])) {
      const [oRows] = await conn.execute('SELECT * FROM product_options WHERE product_group_id = ?', [gRow.id]);
      const options: ModifierOption[] = (oRows as any[]).map(oRow => ({
        id: oRow.id,
        groupId: oRow.product_group_id,
        name: oRow.name,
        extraPrice: oRow.extra_price,
        isAvailable: oRow.is_available === 1,
      }));

      groups.push({
        id: gRow.id,
        menuItemId: gRow.menu_item_id,
        title: gRow.name,
        isRequired: gRow.is_required === 1,
        minSelectable: gRow.min_selectable,
        maxSelectable: gRow.max_selectable,
        options,
      });
    }
    return groups;
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE menu_items SET is_available = ? WHERE id = ?', [isAvailable ? 1 : 0, id]);
  }

  async delete(id: string): Promise<void> {
    const conn = this.db.getConnection();
    await conn.execute('UPDATE menu_items SET deleted_at = NOW() WHERE id = ?', [id]);
  }
}
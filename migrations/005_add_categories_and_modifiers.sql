CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
     restaurant_id CHAR(36) NULL, 
    name VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE, 
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

ALTER TABLE menu_items ADD COLUMN category_id VARCHAR(36) AFTER restaurant_id;
ALTER TABLE menu_items ADD FOREIGN KEY (category_id) REFERENCES categories(id);

ALTER TABLE menu_items MODIFY COLUMN category_id CHAR(36);

ALTER TABLE menu_items MODIFY COLUMN prep_time INT NULL;

CREATE TABLE IF NOT EXISTS modifier_groups (
    id VARCHAR(36) PRIMARY KEY,
    menu_item_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    min_selectable INT DEFAULT 0,
    max_selectable INT DEFAULT 1,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS modifier_options (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    extra_price DECIMAL(12, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (group_id) REFERENCES modifier_groups(id) ON DELETE CASCADE
);

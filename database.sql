
CREATE TABLE IF NOT EXISTS cities (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS malls (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city_id CHAR(36) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS customers (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    allow_promotions BOOLEAN NOT NULL DEFAULT FALSE,
    promotions_updated_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS cuisines (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NULL,
    name VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    phone VARCHAR(20),
    location_type VARCHAR(100) NOT NULL,
    cuisine_id CHAR(36) NOT NULL,
    city_id CHAR(36) NOT NULL,
    mall_id CHAR(36),
    link VARCHAR(512),
    user_id CHAR(36) NOT NULL,
    logo_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (mall_id) REFERENCES malls(id),
     FOREIGN KEY (cuisine_id) REFERENCES cuisines(id),   
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS operating_hours (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    day_of_week INT NOT NULL,
    open_time VARCHAR(5),
    close_time VARCHAR(5),
    is_closed BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    restaurant_id CHAR(36),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

ALTER TABLE cuisines
ADD CONSTRAINT fk_cuisine_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE restaurants 
ADD CONSTRAINT fk_restauran_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS verification_codes (
    id CHAR(36) PRIMARY KEY,
    entity_id CHAR(36) NOT NULL,
    entity_type VARCHAR(20) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NULL, 
    name VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    menu_category_id CHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    prep_time INT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (menu_category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS qrcodes (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    table_number INT NOT NULL,
    label VARCHAR(100),
    slug_path VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS product_groups (
    id CHAR(36) PRIMARY KEY,
    menu_item_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    min_selectable INT DEFAULT 0,
    max_selectable INT DEFAULT 1,
    is_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_options (
    id CHAR(36) PRIMARY KEY,
    product_group_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    extra_price DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_group_id) REFERENCES product_groups(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS reservations (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    table_number INT,
    reservation_date DATETIME NOT NULL,
    guests INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    cancelled_by ENUM('customer', 'staff', 'system') NULL,
    cancellation_reason TEXT NULL,
    cancelled_by_user_id CHAR(36) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    table_number INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    cancelled_by ENUM('customer', 'staff', 'system') NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    cancellation_reason TEXT NULL,
    cancelled_by_user_id CHAR(36) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cancelled_by_user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_status_history(
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id CHAR(36),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    name VARCHAR(255),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS order_item_modifiers (
    id CHAR(36) PRIMARY KEY,
    order_item_id CHAR(36) NOT NULL,
    product_option_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_option_id) REFERENCES product_options(id)
);

CREATE TABLE IF NOT EXISTS order_reviews (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL UNIQUE,
    restaurant_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    overall_rating TINYINT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comment TEXT,
    wants_contact BOOLEAN NOT NULL DEFAULT FALSE,
    contact_status ENUM('not_required', 'pending', 'contacted', 'resolved') DEFAULT 'not_required',
    resolution_comment TEXT NULL,
    service_rating TINYINT NULL CHECK (service_rating >= 1 AND service_rating <= 5),
    food_rating TINYINT NULL CHECK (food_rating >= 1 AND food_rating <= 5),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS customer_favorites (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (customer_id, menu_item_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications_sent_log (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    notification_type VARCHAR(50),
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
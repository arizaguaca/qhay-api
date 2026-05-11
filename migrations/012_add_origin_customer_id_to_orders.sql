ALTER TABLE orders
ADD COLUMN origin_customer_id CHAR(36) NULL AFTER customer_id,
ADD CONSTRAINT fk_orders_origin_customer FOREIGN KEY (origin_customer_id) REFERENCES customers(id);

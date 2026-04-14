ALTER TABLE restaurants 
  CHANGE COLUMN mall_name mall_id CHAR(36) NULL,
  ADD FOREIGN KEY (mall_id) REFERENCES malls(id) ON DELETE SET NULL;

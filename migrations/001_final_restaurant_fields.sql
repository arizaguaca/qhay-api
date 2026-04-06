-- Consolidated migration for all restaurant field changes
ALTER TABLE restaurants 
  ADD COLUMN location_type VARCHAR(100) NOT NULL AFTER phone,
  ADD COLUMN cuisine_type VARCHAR(100) NOT NULL AFTER location_type,
  ADD COLUMN mall_name VARCHAR(255) NULL AFTER cuisine_type,
  ADD COLUMN link VARCHAR(512) NULL AFTER mall_name;

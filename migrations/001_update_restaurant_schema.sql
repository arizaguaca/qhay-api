-- Consolidated migration from old 001, 002 and 003 files
ALTER TABLE restaurants 
  ADD COLUMN location_type VARCHAR(20) NOT NULL AFTER phone,
  ADD COLUMN cuisine_type VARCHAR(50) NOT NULL AFTER location_type,
  ADD COLUMN mall_name VARCHAR(50) NULL AFTER cuisine_type,
  ADD COLUMN link VARCHAR(255) NULL AFTER mall_name;

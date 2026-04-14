CREATE TABLE IF NOT EXISTS malls (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) DEFAULT 'Medellín'
);

-- Insertar algunos centros comerciales por defecto
INSERT IGNORE INTO malls (id, name, city) VALUES 
(UUID(), 'El Tesoro', 'Medellín'),
(UUID(), 'Santa Fe', 'Medellín'),
(UUID(), 'Mayoroca', 'Sabaneta'),
(UUID(), 'Viva Envigado', 'Envigado'),
(UUID(), 'Premium Plaza', 'Medellín');

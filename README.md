# Table Backend - Clean Architecture

Este es el backend para el proyecto "table", implementado siguiendo los principios de **Clean Architecture** en Go.

## Configuración de Base de Datos (MySQL)

El backend ahora requiere una base de datos MySQL. Puedes configurar la conexión mediante variables de entorno (o usar los valores por defecto):

- `DB_USER`: Usuario (defecto: `root`)
- `DB_PASS`: Contraseña (defecto: ``)
- `DB_HOST`: Host (defecto: `localhost`)
- `DB_PORT`: Puerto (defecto: `3306`)
- `DB_NAME`: Nombre de la base de datos (defecto: `table_db`)

### Inicialización de la DB

Ejecuta el script `database.sql` en tu servidor MySQL para crear la tabla necesaria:

```sql
CREATE DATABASE table_db;
USE table_db;
-- Ejecutar contenido de database.sql
```

## Estructura del Proyecto

- `cmd/api/`: Punto de entrada de la aplicación. Aquí se realiza la inyección de dependencias.
- `internal/domain/`: Contiene las entidades de negocio y las interfaces (contratos) para repositorios y casos de uso. Esta capa no tiene dependencias externas.
- `internal/usecase/`: Implementa la lógica de negocio. Depende únicamente de las interfaces del dominio.
- `internal/repository/`: Implementaciones concretas de acceso a datos (ej. SQL, NoSQL, In-memory).
- `internal/http/`: Capa de transporte. Maneja las peticiones HTTP y formatea las respuestas.

## Cómo ejecutar

1. Asegúrate de tener Go instalado.
2. Ejecuta el servidor:
   ```bash
   go run cmd/api/main.go
   ```
3. El servidor estará disponible en `http://localhost:8080`.

## Endpoints

- `POST /tables`: Crear una nueva tabla.
- `GET /tables`: Listar todas las tablas.

## Frontend (React + Vite)

Ubicado en la carpeta `frontend/`. Utiliza React con Vite, Framer Motion para animaciones y Lucide React para iconos.

### Cómo ejecutar

1. Entra en la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

app para realizar pedidos de forma autonoma en los restaurantes

# QHay API - Clean Architecture

This is the backend for the QHay restaurant management system, implemented following the **Clean Architecture** principles in Node.js with TypeScript.

## Database Setup (MySQL)

The backend requires a MySQL database. Configure the connection via environment variables (or use default values):

- `DB_USER`: User (default: `root`)
- `DB_PASS`: Password (default: ``)
- `DB_HOST`: Host (default: `localhost`)
- `DB_PORT`: Port (default: `3306`)
- `DB_NAME`: Database name (default: `table_db`)

### Initialize DB

Execute the `database.sql` script in your MySQL server to create the necessary tables:

```sql
CREATE DATABASE table_db;
USE table_db;
-- Execute contents of database.sql
```

## Project Structure

- `src/config/`: Configuration loading from environment variables.
- `src/domain/entities/`: Business entities and domain models.
- `src/domain/repositories/`: Repository interfaces (contracts).
- `src/application/use-cases/`: Application business logic (use cases).
- `src/infrastructure/database/`: Database implementations (MySQL repositories).
- `src/infrastructure/web/controllers/`: HTTP request handlers.
- `src/infrastructure/web/routes/`: Route definitions.
- `src/index.ts`: Application entry point with dependency injection.

## How to Run

1. Ensure Node.js and npm are installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```
5. The server will be available at `http://localhost:8080`.

## Endpoints

- `POST /restaurants`: Create a new restaurant.
- `GET /restaurants`: List all restaurants.
- `GET /restaurants/:id`: Get restaurant by ID.
- `PUT /restaurants/:id`: Update restaurant.
- `GET /restaurants/owner/:ownerId`: Get restaurants by owner.

- `POST /users`: Create a new user.
- `POST /users/login`: User login.
- And more for users, customers, menus, orders, etc.

## Testing

Run tests with:
```bash
npm test
```

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

# QHay API - Clean Architecture

Esta es la API del sistema de gestión de restaurantes QHay, implementada siguiendo los principios de **Clean Architecture** en Node.js con TypeScript.

## Descripción del Proyecto

QHay es una plataforma diseñada para permitir a los clientes realizar pedidos de forma autónoma en restaurantes a través de códigos QR. La API gestiona restaurantes, usuarios, clientes, menús, pedidos, horarios de atención, reservas y centros comerciales (malls).

## Características Principales

- **Arquitectura Limpia**: Separación clara entre dominio, aplicación e infraestructura.
- **Gestión de Restaurantes y Malls**: Control detallado de establecimientos.
- **Menús Dinámicos**: Soporte para categorías y modificadores de productos.
- **Códigos QR**: Generación automática de códigos QR para cada restaurante.
- **Autenticación**: Seguridad mediante JWT y Bcrypt.
- **Gestión de Imágenes**: Procesamiento y optimización de imágenes (Sharp y Multer).
- **Servicio de Verificación**: Sistema de códigos de verificación vía SMS.

## Configuración de la Base de Datos (MySQL)

La API requiere una base de datos MySQL. Configura la conexión mediante variables de entorno (puedes usar los archivos `.env.*` como referencia):

- `DB_USER`: Usuario (ej: `root`)
- `DB_PASS`: Contraseña
- `DB_HOST`: Host (ej: `localhost`)
- `DB_PORT`: Puerto (ej: `3306`)
- `DB_NAME`: Nombre de la base de datos (ej: `qhay_db`)

### Inicialización de la DB

1. Crea la base de datos en tu servidor MySQL.
2. Ejecuta los scripts en la carpeta `migrations/` en orden para crear las tablas y campos necesarios.

## Estructura del Proyecto

- `src/domain/entities/`: Entidades de negocio y modelos de dominio.
- `src/domain/repositories/`: Interfaces de repositorio (contratos).
- `src/application/use-cases/`: Lógica de negocio de la aplicación (casos de uso).
- `src/infrastructure/database/`: Implementaciones de bases de datos (repositorios MySQL).
- `src/infrastructure/web/controllers/`: Controladores de peticiones HTTP.
- `src/infrastructure/web/routes/`: Definición de rutas Express.
- `src/infrastructure/middlewares/`: Middlewares para subida de archivos y otros.
- `uploads/`: Directorio donde se almacenan logos e imágenes de menús.
- `migrations/`: Scripts SQL para la estructura de la base de datos.
- `src/index.ts`: Punto de entrada de la aplicación con inyección de dependencias.

## Instalación y Ejecución

1. Asegúrate de tener Node.js instalado.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Compila el proyecto:
   ```bash
   npm run build
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```
   O para desarrollo:
   ```bash
   npm run dev
   ```
5. El servidor estará disponible en `http://localhost:8080`.

## Endpoints Principales (Prefijo: `/api/v1`)

### Restaurantes
- `POST /restaurants`: Crear restaurante (con logo).
- `GET /restaurants`: Listar todos los restaurantes.
- `GET /restaurants/:id`: Obtener detalle.
- `PUT /restaurants/:id`: Actualizar datos.
- `GET /restaurants/owner/:ownerId`: Listar por dueño.

### Usuarios y Autenticación
- `POST /users`: Crear usuario.
- `POST /auth/login`: Iniciar sesión.
- `GET /users/:id/restaurants`: Restaurantes asociados al usuario.

### Clientes y Verificación
- `POST /customers`: Registrar cliente.
- `POST /verification/send`: Enviar código SMS.
- `POST /verification/verify`: Validar código.

### Menús y Pedidos
- `GET /menus/restaurant/:id`: Obtener menú completo de un restaurante.
- `POST /orders`: Crear un nuevo pedido.
- `GET /orders/restaurant/:id`: Listar pedidos de un restaurante.

### Otros
- `GET /malls`: Listar centros comerciales.
- `GET /qrcodes/restaurant/:id`: Obtener/generar código QR.
- `GET /operating-hours/restaurant/:id`: Horarios de atención.

## Pruebas

Ejecuta los tests con:
```bash
npm test
```

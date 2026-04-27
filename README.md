# QHay API

API REST para la plataforma de gestión de restaurantes **QHay**, construida con **Clean Architecture** en Node.js + TypeScript.

QHay permite a los clientes realizar pedidos de forma autónoma en restaurantes a través de códigos QR, gestionar menús con modificadores de producto, manejar reservas, reseñas y favoritos.

---

## Tabla de Contenido

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Modelo de Datos](#modelo-de-datos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecución](#ejecución)
- [API Endpoints](#api-endpoints)
  - [Autenticación y Usuarios](#1-autenticación-y-usuarios)
  - [Restaurantes](#2-restaurantes)
  - [Menús y Categorías](#3-menús-y-categorías)
  - [Pedidos (Orders)](#4-pedidos-orders)
  - [Reseñas de Pedidos](#5-reseñas-de-pedidos)
  - [Clientes](#6-clientes)
  - [Favoritos](#7-favoritos)
  - [Reservas](#8-reservas)
  - [Códigos QR](#9-códigos-qr)
  - [Horarios de Atención](#10-horarios-de-atención)
  - [Verificación](#11-verificación)
  - [Ciudades, Malls y Tipos de Cocina](#12-ciudades-malls-y-tipos-de-cocina)
- [Casos de Uso](#casos-de-uso)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Características

- **Clean Architecture** — Separación estricta entre dominio, aplicación e infraestructura.
- **Gestión completa de restaurantes** — CRUD, logos, ubicación, tipos de cocina.
- **Menús dinámicos** — Categorías, items con imagen, grupos de modificadores (product groups) y opciones.
- **Pedidos con modificadores** — Los clientes pueden personalizar cada item con opciones y notas.
- **Historial de estados** — Cada cambio de estado del pedido se registra en `order_status_history`.
- **Reseñas** — Los clientes pueden calificar pedidos (comida, servicio, comentarios) con opción de contacto.
- **Favoritos** — Los clientes pueden marcar/desmarcar items del menú como favoritos.
- **Códigos QR** — Generación automática por mesa/zona del restaurante.
- **Reservas** — Con soporte de cancelación por cliente, staff o sistema.
- **Verificación multicanal** — Códigos de verificación via SMS (Twilio), WhatsApp o Email (Resend).
- **Gestión de imágenes** — Procesamiento y optimización con Sharp + Multer.
- **Ciudades, Malls y Tipos de Cocina** — Catálogos base para ubicación y clasificación.

---

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│                   index.ts                       │
│            (Composición & Inyección)             │
├──────────────────────────────────────────────────┤
│  Infrastructure                                  │
│  ├── web/routes/          → Definición de rutas  │
│  ├── web/controllers/     → Controladores HTTP   │
│  ├── web/middlewares/     → Upload, auth, etc.   │
│  ├── database/            → MySQL Repositories   │
│  └── notifications/       → SMS, Email, WhatsApp │
├──────────────────────────────────────────────────┤
│  Application                                     │
│  ├── use-cases/           → Lógica de negocio    │
│  ├── strategies/          → Estrategias verif.   │
│  └── registration/        → Registro + verif.    │
├──────────────────────────────────────────────────┤
│  Domain                                          │
│  ├── entities/            → Interfaces de datos  │
│  ├── repositories/        → Contratos (ports)    │
│  ├── notifications/       → Contratos notif.     │
│  └── strategies/          → Contratos estrategia │
└──────────────────────────────────────────────────┘
```

---

## Modelo de Datos

Las siguientes tablas componen la base de datos (`database.sql`):

| Tabla | Descripción |
|-------|------------|
| `cities` | Ciudades disponibles |
| `malls` | Centros comerciales (referencia a `cities`) |
| `customers` | Clientes registrados |
| `cuisines` | Tipos de cocina (globales o custom por usuario) |
| `restaurants` | Restaurantes con cocina, ciudad, mall opcional |
| `operating_hours` | Horarios de atención por día de la semana |
| `users` | Usuarios del sistema (owner, admin, staff) |
| `verification_codes` | Códigos de verificación por SMS/email/WhatsApp |
| `menu_categories` | Categorías de menú (globales o por restaurante) |
| `menu_items` | Items del menú con precio, imagen, disponibilidad |
| `product_groups` | Grupos de modificadores (ej: "Tamaño", "Extras") |
| `product_options` | Opciones dentro de un grupo (ej: "Grande", "Queso extra") |
| `qrcodes` | Códigos QR por mesa/zona del restaurante |
| `reservations` | Reservas de clientes |
| `orders` | Pedidos con estado, total y cancelación |
| `order_status_history` | Historial de cambios de estado del pedido |
| `order_items` | Items individuales del pedido |
| `order_item_modifiers` | Modificadores aplicados a cada item del pedido |
| `order_reviews` | Reseñas con rating, comentario y contacto |
| `customer_favorites` | Favoritos de clientes (items del menú) |
| `notifications_sent_log` | Log de notificaciones enviadas |

---

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd qhay-api

# Instalar dependencias
npm install
```

**Requisitos:**
- Node.js ≥ 18
- MySQL ≥ 8.0

---

## Variables de Entorno

Copia `.env.example` a `.env.dev` y configura:

```env
APP_ENV=dev
DB_USER=root
DB_PASS=tu_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=qhaay_db

# Twilio (SMS y WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=

# Email (Resend)
EMAIL_RESEND_API_KEY=
EMAIL_FROM=

# Verificación
VERIFICATION_CODE_EXPIRATION_MINUTES=5
```

---

## Ejecución

```bash
# Desarrollo (con ts-node)
npm run dev

# Producción
npm run build
npm start
```

El servidor se levanta en `http://localhost:8080`. La base de datos y las tablas se crean automáticamente al iniciar (usando `database.sql`).

---

## API Endpoints

> **Base URL:** `http://localhost:8080/api/v1`

---

### 1. Autenticación y Usuarios

#### Crear usuario (con verificación)
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+573001234567",
    "password": "mi_password_seguro",
    "role": "owner",
    "channel": "email"
  }'
```
> **Respuesta:** `201` — Se crea el usuario y se envía código de verificación al canal indicado.

#### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "mi_password_seguro"
  }'
```
> **Respuesta:** `200` — Retorna el objeto usuario completo.

#### Obtener usuario por ID
```bash
curl http://localhost:8080/api/v1/users/{id}
```

#### Obtener usuario por email
```bash
curl http://localhost:8080/api/v1/users/email/{email}
```

#### Obtener usuario por teléfono
```bash
curl http://localhost:8080/api/v1/users/phone/{phone}
```

#### Listar staff de un restaurante
```bash
curl http://localhost:8080/api/v1/users/staff/{restaurantId}
```

#### Obtener restaurantes de un usuario
```bash
curl http://localhost:8080/api/v1/users/{userId}/restaurants
```

#### Actualizar usuario
```bash
curl -X PUT http://localhost:8080/api/v1/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Pérez Actualizado",
    "email": "juan@example.com",
    "phone": "+573001234567",
    "role": "owner"
  }'
```

#### Eliminar usuario
```bash
curl -X DELETE http://localhost:8080/api/v1/users/{id}
```

---

### 2. Restaurantes

#### Crear restaurante (con logo)
```bash
curl -X POST http://localhost:8080/api/v1/restaurants \
  -F "name=Mi Restaurante" \
  -F "description=Comida colombiana" \
  -F "address=Calle 123" \
  -F "phone=+573001234567" \
  -F "locationType=Standalone" \
  -F "cuisineId=UUID_CUISINE" \
  -F "cityId=UUID_CITY" \
  -F "userId=UUID_OWNER" \
  -F "logo=@/ruta/al/logo.png"
```

#### Listar todos los restaurantes
```bash
curl http://localhost:8080/api/v1/restaurants
```

#### Obtener restaurante por ID
```bash
curl http://localhost:8080/api/v1/restaurants/{id}
```

#### Obtener restaurantes por dueño
```bash
curl http://localhost:8080/api/v1/restaurants/owner/{ownerId}
```

#### Actualizar restaurante
```bash
curl -X PUT http://localhost:8080/api/v1/restaurants/{id} \
  -F "name=Nuevo Nombre" \
  -F "description=Nueva descripción" \
  -F "logo=@/ruta/al/nuevo-logo.png"
```

> **Nota:** `locationType` puede ser `"Standalone"` o `"Food Court"`. Si es `"Food Court"`, el campo `mallId` es obligatorio.

---

### 3. Menús y Categorías

#### Crear categoría de menú
```bash
curl -X POST http://localhost:8080/api/v1/menus/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Entradas",
    "restaurantId": "UUID_RESTAURANT",
    "isCustom": true
  }'
```

#### Listar categorías de un restaurante
```bash
curl http://localhost:8080/api/v1/menus/categories/restaurant/{restaurantId}
```

#### Crear item de menú (con imagen y modificadores)
```bash
curl -X POST http://localhost:8080/api/v1/menus \
  -F "restaurantId=UUID_RESTAURANT" \
  -F "categoryId=UUID_CATEGORY" \
  -F "name=Bandeja Paisa" \
  -F "description=Plato típico colombiano" \
  -F "price=25000" \
  -F "prepTime=20" \
  -F "isAvailable=true" \
  -F "image=@/ruta/a/imagen.jpg" \
  -F 'groups=[{
    "id": "UUID_GROUP",
    "title": "Proteína",
    "isRequired": true,
    "minSelectable": 1,
    "maxSelectable": 1,
    "options": [
      { "id": "UUID_OPT_1", "name": "Res", "extraPrice": 0 },
      { "id": "UUID_OPT_2", "name": "Pollo", "extraPrice": 0 },
      { "id": "UUID_OPT_3", "name": "Cerdo", "extraPrice": 2000 }
    ]
  }]'
```

#### Obtener menú completo de un restaurante
```bash
curl http://localhost:8080/api/v1/menus/restaurant/{restaurantId}
```
> **Respuesta:** Array de items con sus `groups` (modificadores) y `options` incluidos.

#### Obtener item por ID
```bash
curl http://localhost:8080/api/v1/menus/{id}
```

#### Actualizar item de menú
```bash
curl -X PUT http://localhost:8080/api/v1/menus/{id} \
  -F "name=Bandeja Paisa Especial" \
  -F "price=28000" \
  -F "image=@/ruta/a/nueva-imagen.jpg"
```

#### Eliminar item de menú
```bash
curl -X DELETE http://localhost:8080/api/v1/menus/{id}
```

---

### 4. Pedidos (Orders)

#### Crear pedido
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "UUID_RESTAURANT",
    "customerId": "UUID_CUSTOMER",
    "tableNumber": 5,
    "items": [
      {
        "menuItemId": "UUID_MENU_ITEM",
        "name": "Bandeja Paisa",
        "quantity": 2,
        "unitPrice": 25000,
        "notes": "Sin frijoles por favor",
        "modifiers": [
          {
            "productOptionId": "UUID_OPTION",
            "name": "Pollo",
            "price": 0
          }
        ]
      },
      {
        "menuItemId": "UUID_MENU_ITEM_2",
        "name": "Limonada",
        "quantity": 1,
        "unitPrice": 5000
      }
    ]
  }'
```
> El `totalAmount` se calcula automáticamente si no se envía.

#### Listar pedidos por restaurante
```bash
curl "http://localhost:8080/api/v1/orders?restaurant_id=UUID_RESTAURANT"
```

#### Listar pedidos por cliente
```bash
curl "http://localhost:8080/api/v1/orders?customer_id=UUID_CUSTOMER"
```

#### Obtener pedido por ID
```bash
curl http://localhost:8080/api/v1/orders/{id}
```

#### Actualizar estado del pedido
```bash
curl -X PATCH http://localhost:8080/api/v1/orders/{id}/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "preparing" }'
```

**Estados válidos:** `pending` → `preparing` → `ready` → `delivered` → `paid` | `cancelled`

---

### 5. Reseñas de Pedidos

#### Crear reseña
```bash
curl -X POST http://localhost:8080/api/v1/order-reviews \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "UUID_ORDER",
    "restaurantId": "UUID_RESTAURANT",
    "customerId": "UUID_CUSTOMER",
    "overallRating": 4,
    "comment": "Muy buena comida, servicio un poco lento",
    "serviceRating": 3,
    "foodRating": 5,
    "wantsContact": true
  }'
```
> Si `wantsContact` es `true`, el `contactStatus` se establece automáticamente como `"pending"`.

#### Obtener reseña por pedido
```bash
curl http://localhost:8080/api/v1/order-reviews/order/{orderId}
```

#### Listar reseñas por restaurante
```bash
curl http://localhost:8080/api/v1/order-reviews/restaurant/{restaurantId}
```

#### Listar reseñas por cliente
```bash
curl http://localhost:8080/api/v1/order-reviews/customer/{customerId}
```

---

### 6. Clientes

#### Registrar cliente (con verificación)
```bash
curl -X POST http://localhost:8080/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "María García",
    "phone": "+573009876543",
    "channel": "whatsapp"
  }'
```
> Se crea el cliente y se envía código de verificación al canal indicado (`sms` o `whatsapp`).

#### Obtener cliente por ID
```bash
curl http://localhost:8080/api/v1/customers/{id}
```

#### Obtener cliente por teléfono
```bash
curl http://localhost:8080/api/v1/customers/phone/{phone}
```

#### Actualizar cliente
```bash
curl -X PUT http://localhost:8080/api/v1/customers/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "id": "UUID_CUSTOMER",
    "fullName": "María García López",
    "phone": "+573009876543",
    "allowPromotions": true
  }'
```

---

### 7. Favoritos

#### Toggle favorito (agregar o quitar)
```bash
curl -X POST http://localhost:8080/api/v1/favorites/toggle \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "UUID_CUSTOMER",
    "menuItemId": "UUID_MENU_ITEM"
  }'
```
> **Respuesta:** `{ "added": true }` si se agregó, `{ "added": false }` si se quitó.

#### Listar favoritos de un cliente
```bash
curl http://localhost:8080/api/v1/favorites/customer/{customerId}
```

---

### 8. Reservas

#### Crear reserva
```bash
curl -X POST http://localhost:8080/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "UUID_CUSTOMER",
    "restaurantId": "UUID_RESTAURANT",
    "tableNumber": 3,
    "reservationDate": "2026-05-01T19:00:00",
    "guests": 4
  }'
```

#### Obtener reserva por ID
```bash
curl http://localhost:8080/api/v1/reservations/{id}
```

**Estados de reserva:** `pending` → `confirmed` → `completed` | `cancelled`

---

### 9. Códigos QR

#### Generar QR para una mesa
```bash
curl -X POST http://localhost:8080/api/v1/qrcodes \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "UUID_RESTAURANT",
    "tableNumber": 1,
    "label": "Mesa 1"
  }'
```

#### Obtener QR por ID
```bash
curl http://localhost:8080/api/v1/qrcodes/{id}
```

#### Listar QRs de un restaurante
```bash
curl http://localhost:8080/api/v1/qrcodes/restaurant/{restaurantId}
```

#### Eliminar QR
```bash
curl -X DELETE http://localhost:8080/api/v1/qrcodes/{id}
```

---

### 10. Horarios de Atención

#### Guardar/actualizar horarios
```bash
curl -X POST http://localhost:8080/api/v1/operating-hours/{restaurantId}/hours \
  -H "Content-Type: application/json" \
  -d '[
    { "dayOfWeek": 1, "openTime": "08:00", "closeTime": "22:00", "isClosed": false },
    { "dayOfWeek": 2, "openTime": "08:00", "closeTime": "22:00", "isClosed": false },
    { "dayOfWeek": 0, "openTime": "", "closeTime": "", "isClosed": true }
  ]'
```
> `dayOfWeek`: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

#### Obtener horarios de un restaurante
```bash
curl http://localhost:8080/api/v1/operating-hours/{restaurantId}/hours
```

---

### 11. Verificación

#### Enviar código de verificación
```bash
curl -X POST http://localhost:8080/api/v1/verification/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "+573001234567",
    "channel": "sms",
    "entityType": "customer"
  }'
```
> **Canales:** `sms`, `whatsapp`, `email`
> **Tipos de entidad:** `customer`, `user`

#### Verificar código
```bash
curl -X POST http://localhost:8080/api/v1/verification/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "contact": "+573001234567",
    "code": "123456"
  }'
```
> **Respuesta:** `{ "entityId": "UUID" }` — Retorna el ID del cliente o usuario verificado.

---

### 12. Ciudades, Malls y Tipos de Cocina

#### Listar ciudades
```bash
curl http://localhost:8080/api/v1/cities
```

#### Listar todos los malls
```bash
curl http://localhost:8080/api/v1/malls
```

#### Listar malls por ciudad
```bash
curl http://localhost:8080/api/v1/malls/city/{cityId}
```

#### Listar tipos de cocina (globales)
```bash
curl http://localhost:8080/api/v1/cuisine-types
```

#### Listar tipos de cocina por dueño (globales + custom)
```bash
curl http://localhost:8080/api/v1/cuisine-types/owner/{ownerId}
```

#### Crear tipo de cocina personalizado
```bash
curl -X POST http://localhost:8080/api/v1/cuisine-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cocina Fusión",
    "userId": "UUID_OWNER"
  }'
```
> Si se envía `userId`, se marca como `isCustom: true`.

#### Eliminar tipo de cocina
```bash
curl -X DELETE http://localhost:8080/api/v1/cuisine-types/{id}
```

---

## Casos de Uso

### Flujo de Registro de Usuario (Owner)
1. `POST /users` — Crea el usuario con `role: "owner"` y envía código de verificación.
2. `POST /verification/verify-code` — El usuario verifica su cuenta.
3. `POST /restaurants` — Crea su restaurante vinculado.
4. `POST /menus` — Agrega items al menú con categorías y modificadores.
5. `POST /qrcodes` — Genera códigos QR para cada mesa.
6. `POST /operating-hours/{restaurantId}/hours` — Configura horarios.

### Flujo de Pedido de Cliente
1. El cliente escanea el QR → se identifica la mesa y restaurante.
2. `POST /customers` — Se registra con su teléfono (recibe código de verificación).
3. `POST /verification/verify-code` — Verifica su cuenta.
4. `GET /menus/restaurant/{restaurantId}` — Ve el menú completo.
5. `POST /orders` — Envía su pedido con items, cantidades, notas y modificadores.
6. El restaurante actualiza: `PATCH /orders/{id}/status` → `preparing` → `ready` → `delivered`.

### Flujo de Reseña
1. Después de que el pedido está `delivered` o `paid`.
2. `POST /order-reviews` — El cliente deja su calificación.
3. Si `wantsContact: true`, el restaurante puede dar seguimiento (`contact_status`).

### Flujo de Favoritos
1. `POST /favorites/toggle` — El cliente marca/desmarca items.
2. `GET /favorites/customer/{customerId}` — Consulta sus favoritos.

### Flujo de Reserva
1. `POST /reservations` — El cliente crea una reserva.
2. El restaurante confirma: `PATCH` el status a `confirmed`.

---

## Estructura del Proyecto

```
src/
├── config/                         # Configuración de la app
│   └── config.ts
├── domain/                         # Capa de dominio (sin dependencias)
│   ├── entities/                   # Interfaces de datos
│   │   ├── restaurant.ts
│   │   ├── user.ts
│   │   ├── customer.ts
│   │   ├── order.ts                # Order, OrderItem, OrderItemModifier
│   │   ├── order-review.ts
│   │   ├── order-status-history.ts
│   │   ├── menu-item.ts
│   │   ├── modifier.ts             # ModifierGroup, ModifierOption
│   │   ├── category.ts
│   │   ├── cuisine-type.ts
│   │   ├── reservation.ts
│   │   ├── qrcode.ts
│   │   ├── operating-hour.ts
│   │   ├── customer-favorite.ts
│   │   ├── notification-sent-log.ts
│   │   ├── verification-code.ts
│   │   ├── city.ts
│   │   └── mall.ts
│   ├── repositories/               # Interfaces de repositorio
│   ├── notifications/              # Contratos de notificaciones
│   └── strategies/                 # Contratos de estrategias
├── application/                    # Capa de aplicación
│   ├── use-cases/                  # Lógica de negocio
│   │   ├── registration/           # Registro con verificación
│   │   └── ...
│   └── strategies/                 # Implementaciones de estrategias
├── infrastructure/                 # Capa de infraestructura
│   ├── database/                   # MySQL repositories
│   ├── notifications/              # SMS, Email, WhatsApp providers
│   └── web/
│       ├── controllers/            # Controladores HTTP
│       ├── routes/                 # Definición de rutas Express
│       └── middlewares/            # Upload de archivos, etc.
├── index.ts                        # Punto de entrada (composición raíz)
database.sql                        # Schema completo de la DB
uploads/                            # Logos e imágenes de menú
```

---

## Tecnologías

| Tecnología | Uso |
|-----------|-----|
| **Node.js + TypeScript** | Runtime y lenguaje |
| **Express** | Framework HTTP |
| **MySQL** (mysql2) | Base de datos |
| **bcrypt** | Hashing de contraseñas |
| **Multer + Sharp** | Upload y procesamiento de imágenes |
| **Twilio** | SMS y WhatsApp |
| **Resend** | Email transaccional |
| **QRCode** | Generación de códigos QR |
| **UUID** | Generación de IDs |

---

## Scripts Disponibles

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Inicia el servidor en modo desarrollo (ts-node) |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia el servidor compilado (producción) |
| `npm test` | Ejecuta los tests |
| `npm run test:watch` | Tests en modo watch |

# TASK.md — Neo Tech E-commerce (Plan de Desarrollo)

Este archivo contiene el paso a paso completo para desarrollar el e-commerce desde el estado actual hasta producción.

---

## Estado actual

- [x] Backend: servidor Express arranca con `npm run dev`
- [x] DB: PostgreSQL conectada, tabla `Users` creada vía Sequelize sync
- [x] Errores: sistema completo (AppError, catchAsync, errorMatchers, error.controller)
- [x] Auth: middleware JWT funcional (protect, restrictTo)
- [x] Plugins: JWT generator + bcrypt hash/verify funcionando
- [x] Dependencias: todas instaladas (308 paquetes)
- [x] Imports: todos corregidos y verificados
- [x] ESLint + Prettier: configurados, 0 warnings
- [x] Docker: `Dockerfile` + `.dockerignore` + `docker-compose.yml` creados
- [x] Imagen Docker: build exitoso con `node:24-alpine`

---

## FASE 1 — Backend Core (Auth + Productos) ✅

### 1.1 Completar modelo User ✅

- [x] **`models/authModel.js`** — Agregar campos:
  - `acceptedTerms: BOOLEAN, allowNull: false, defaultValue: false`
  - `acceptedMarketing: BOOLEAN, allowNull: false, defaultValue: false`
  - `termsAcceptedAt: DATE, allowNull: true`
- [x] DB sincronizada con `alter: true`

### 1.2 Crear modelo Product ✅

- [x] **`models/productModel.js`** — Modelo completo con:
  - `id: UUID, PK` / `name: STRING` / `slug: STRING, unique`
  - `description: TEXT` / `price: DECIMAL(10,2)`
  - `stock: INTEGER` / `imageUrl` / `isActive`

### 1.3 Validaciones Zod ✅

- [x] **`schemas/product.schema.js`** — Schemas create, update, query
- [x] **`schemas/auth.schema.js`** — Register validación de `acceptedTerms` (refine true) y `acceptedMarketing` (optional)

### 1.4 Services ✅

- [x] **`services/product.services.js`** — ProductService con findAll, findById, findBySlug, create, update, disable

### 1.5 Controllers ✅

- [x] **`controllers/productController.js`** — Handlers CRUD
- [x] **`controllers/authController.js`** — Register guarda `termsAcceptedAt`, agrega getProfile y updateProfile

### 1.6 Middlewares adicionales ✅

- [x] **`middlewares/validate.middleware.js`** — Middleware Zod genérico reutilizable

### 1.7 Routes ✅

- [x] **`routes/authRoutes.js`** — register, login, getProfile, updateProfile
- [x] **`routes/productRoutes.js`** — CRUD completo con protect + restrictTo("ADMIN")
- [x] **`routes/routes.js`** — Monta auth + product bajo `/api/v1`

### 1.8 Seeders ✅

- [x] **`seeders/adminSeeder.js`** — Crea admin por defecto, correr con `node seeders/adminSeeder.js`
- [x] Script `"seed": "node seeders/adminSeeder.js"` agregado a package.json

---

## FASE 2 — Frontend Base

### 2.1 Setup del proyecto

- [ ] Crear `frontend/` con Vite + React
- [ ] Instalar e configurar Tailwind CSS v4
- [ ] Configurar proxy en `vite.config.js` para `/api` → `http://localhost:3000`
- [ ] Instalar dependencias: `react-router-dom`, `axios`, `lucide-react` (iconos)

### 2.2 Estructura base

- [ ] **`frontend/src/main.jsx`** — Entry point con RouterProvider
- [ ] **`frontend/src/App.jsx`** — Layout raíz con outlet
- [ ] **`frontend/src/routes.jsx`** — Definición de rutas
- [ ] **`frontend/src/config/api.js`** — Instancia de axios con baseURL

### 2.3 Auth context

- [ ] **`frontend/src/context/AuthContext.jsx`** — Contexto de autenticación:
  - Estado: user, token, loading
  - Acciones: login, register, logout, loadUser
  - Token guardado en localStorage
  - Al iniciar: si hay token, cargar perfil del usuario
- [ ] **`frontend/src/components/ProtectedRoute.jsx`** — Redirect a login si no hay token
- [ ] **`frontend/src/components/AdminRoute.jsx`** — Redirect si role !== ADMIN

### 2.4 Páginas de Auth

- [ ] **`frontend/src/pages/LoginPage.jsx`** — Formulario email + password
- [ ] **`frontend/src/pages/RegisterPage.jsx`** — Formulario con:
  - fullname, email, password, confirmPassword
  - Checkbox `acceptedTerms` (obligatorio, bloquea submit)
  - Checkbox `acceptedMarketing` (opcional)
  - Mensaje de error si no acepta términos
- [ ] **`frontend/src/components/AuthLayout.jsx`** — Layout compartido para login/register

### 2.5 Catálogo de productos

- [ ] **`frontend/src/services/product.service.js`** — Llamadas a la API de productos
- [ ] **`frontend/src/pages/ProductListPage.jsx`** — Grid de productos con:
  - Cards con imagen, nombre, precio
  - Estado vacío si no hay productos
  - Estado de carga (skeleton/spinner)
  - Estado de error
- [ ] **`frontend/src/pages/ProductDetailPage.jsx`** — Página individual del producto
- [ ] **`frontend/src/components/ProductCard.jsx`** — Card reutilizable
- [ ] **`frontend/src/components/Navbar.jsx`** — Barra de navegación con logo, enlaces, carrito

---

## FASE 3 — Carrito + Checkout + Mercado Pago

### 3.1 Carrito (client-side)

- [ ] **`frontend/src/context/CartContext.jsx`** — Estado del carrito:
  - items: [{ product, quantity }]
  - totalItems, totalPrice
  - addItem(product, quantity)
  - removeItem(productId)
  - updateQuantity(productId, quantity)
  - clearCart()
  - Persistencia en localStorage
- [ ] **`frontend/src/components/CartDrawer.jsx`** — Panel lateral con items del carrito
- [ ] **`frontend/src/pages/CartPage.jsx`** — Página completa del carrito

### 3.2 Modelo Order (backend)

- [ ] **`models/orderModel.js`** — Order con:
  - `id: UUID, PK`
  - `orderNumber: STRING, unique` — ej: `NT-000001`
  - `userId: UUID, FK -> Users` (nullable para clientes no logueados)
  - `status: ENUM("pending", "paid", "cancelled"), defaultValue: "pending"`
  - `total: DECIMAL(10,2)`
  - `customerName, customerEmail, customerPhone` — datos del comprador
  - timestamps
- [ ] **`models/orderItemModel.js`** — OrderItem con:
  - `id, orderId (FK), productId (FK)`
  - `productName, unitPrice, quantity, subtotal` (snapshot del producto al momento de comprar)

### 3.3 Secuencia para números de pedido

- [ ] **`database/migrations/001-create-order-sequence.js`** — SQL:
  ```sql
  CREATE SEQUENCE IF NOT EXISTS order_numbers START 1;
  ```
- [ ] En OrderService: `getNextOrderNumber()` que hace:
  ```sql
  SELECT nextval('order_numbers') as num
  ```
  y formatea como `NT-${String(num).padStart(6, '0')}`

### 3.4 Order Service (backend)

- [ ] **`services/order.service.js`** — OrderService con:
  - `create(data, items)` — crear orden + orderItems + generar orderNumber en transacción
  - `findById(id)` — buscar con items incluidos
  - `findByOrderNumber(number)` — buscar por número
  - `findByUser(userId)` — historial del usuario
  - `updateStatus(order, status)` — cambiar estado

### 3.5 Orden controller + routes

- [ ] **`controllers/order.controller.js`** — Handlers
- [ ] **`routes/order.routes.js`**:
  - `POST /orders` — crear orden (público, recibe carrito + datos de contacto)
  - `GET /orders/:id` — ver orden (protegido, solo dueño o admin)
  - `GET /orders/my-orders` — historial del usuario (protegido)

### 3.6 Integración Mercado Pago

- [ ] **`config/mercadopago.js`** — Inicializar SDK:
  ```js
  import { MercadoPagoConfig, Preference } from "mercadopago";
  const client = new MercadoPagoConfig({ accessToken: envs.MP_ACCESS_TOKEN });
  export { client, Preference };
  ```
- [ ] **`services/payment.service.js`** — PaymentService:
  - `createPreference(order)` — crea la preferencia en MP con items de la orden
    - `external_reference = order.orderNumber`
    - `notification_url = ${BASE_URL}/api/v1/payments/webhook`
    - `back_urls.success = ${FRONTEND_URL}/orders/${orderNumber}`
  - `processWebhook(notification)` — valida, busca orden, actualiza a paid
  - Idempotencia: si la orden ya está `paid`, no re-procesar
  - **Stock**: al confirmar el pago, descontar stock de cada producto:
    ```js
    for (const item of order.Items) {
      await Product.decrement("stock", {
        by: item.quantity,
        where: { id: item.productId },
      });
    }
    ```
    - No descontar stock antes del webhook (solo cuando el pago está confirmado)
    - Si un producto no tiene stock suficiente, marcar la orden como `cancelled` y notificar al admin
- [ ] **`controllers/payment.controller.js`**:
  - `createPreference` — crea orden + preferencia y devuelve init_point
  - `webhookHandler` — recibe notificación de MP, procesa async
- [ ] **`routes/payment.routes.js`**:
  - `POST /payments/create-preference` — crea preference (público)
  - `POST /payments/webhook` — webhook de MP (público, sin auth)

### 3.7 Checkout frontend

- [ ] **`frontend/src/pages/CheckoutPage.jsx`** — Formulario con datos del comprador:
  - Nombre, email, teléfono
  - Resumen del carrito
  - Botón "Pagar con Mercado Pago" → llama a createPreference → redirige a init_point
- [ ] **`frontend/src/pages/OrderSuccessPage.jsx`** — Pantalla de confirmación:
  - Número de pedido
  - Mensaje: "Te enviaremos el recibo por mail"
- [ ] **`frontend/src/pages/OrderDetailPage.jsx`** — Detalle del pedido (protegido)

---

## FASE 4 — Notificaciones: WhatsApp + Mail + PDF

### 4.1 WhatsApp Cloud API

- [ ] **`services/whatsapp.service.js`** — WhatsappService:
  - `sendMessage(to, text)` — envía mensaje de texto vía WhatsApp Cloud API
    - `POST https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
    - Headers: `Authorization: Bearer ${WHATSAPP_TOKEN}`
    - Body: `{ messaging_product: "whatsapp", to, type: "text", text: { body: text } }`
  - `sendOwnerAlert(order)` — arma y envía el mensaje al dueño:
    ```
    🛒 Nuevo pedido: ${orderNumber}
    Cliente: ${customerName}
    Productos:
    - ${item1.productName} x ${item1.quantity} = $${item1.subtotal}
    Total: $${order.total}
    Contacto: ${customerEmail} / ${customerPhone}
    ```

### 4.2 Email (Nodemailer)

- [ ] **`config/mailer.js`** — Crear transporter con Nodemailer (SMTP)
- [ ] **`services/mail.service.js`** — MailService:
  - `sendReceipt(order, pdfBuffer)` — envía mail al cliente con PDF adjunto
  - Asunto: "Tu pedido Neo Tech #${orderNumber} fue confirmado"
  - Body: texto simple con datos del pedido

### 4.3 PDF (pdf-lib)

- [ ] **`services/pdf.service.js`** — PdfService:
  - `generateReceipt(order)` — genera PDF con:
    - Header: "Neo Tech — Recibo de Compra"
    - Número de pedido + fecha
    - Tabla de items: producto, cantidad, precio unitario, subtotal
    - Total
    - Datos del emprendimiento
  - Devuelve: `Uint8Array` (el buffer del PDF)

### 4.4 Orquestación post-pago

- [ ] En `payment.service.js` → `processWebhook`:
  ```js
  // Cuando orden pasa de pending a paid:
  // 1. Disparar notificaciones de forma asíncrona
  setImmediate(async () => {
    await whatsappService.sendOwnerAlert(order);
    const pdfBuffer = await pdfService.generateReceipt(order);
    await mailService.sendReceipt(order, pdfBuffer);
  });
  ```
- [ ] Garantizar idempotencia: checkear `order.status !== "paid"` antes de procesar

---

## FASE 5 — Panel de Administración

### 5.1 Backend: subida de imágenes

- [ ] `npm install multer cloudinary`
- [ ] **`config/cloudinary.js`** — Configurar Cloudinary SDK
- [ ] **`middlewares/upload.middleware.js`** — Multer configurado (memoryStorage, 5MB max, imágenes)
- [ ] **`services/upload.service.js`** — UploadService:
  - `uploadImage(file)` — sube a Cloudinary, devuelve URL
  - `deleteImage(publicId)` — eliminar de Cloudinary

### 5.2 Frontend: admin panel

- [ ] **`frontend/src/pages/admin/ProductListPage.jsx`** — Tabla de productos con:
  - Búsqueda y filtros
  - Switch activo/inactivo
  - Botón editar
- [ ] **`frontend/src/pages/admin/ProductFormPage.jsx`** — Formulario:
  - Nombre, descripción, precio, stock
  - Subida de imagen (drag & drop con preview)
  - Estado activo/inactivo
- [ ] **`frontend/src/pages/admin/OrderListPage.jsx`** — Lista de pedidos:
  - Filtro por estado
  - Detalle al hacer click
- [ ] **`frontend/src/components/admin/AdminLayout.jsx`** — Layout con sidebar

### 5.3 Routes admin (backend)

- [ ] Agregar en `product.routes.js`:
  - `POST /products` — admin
  - `PATCH /products/:id` — admin
  - `DELETE /products/:id` — admin
- [ ] Todas las rutas admin usan: `protect`, `restrictTo("ADMIN")`

---

## FASE 6 — Producción y Deploy

### 6.1 Dockerización

- [x] **`Backend/Dockerfile`** — imagen backend con `node:24-alpine`
- [x] **`Backend/.dockerignore`** — excluye node_modules, .env, .git
- [x] **`docker-compose.yml`** en raíz — backend + postgres con healthcheck
- [ ] **`Dockerfile`** en frontend (multi-stage, para cuando exista el frontend)

### 6.2 Hardening

- [ ] CORS: configurar orígenes permitidos desde env
- [ ] Helmet: `npm install helmet && app.use(helmet())`
- [ ] Rate limiting: `npm install express-rate-limit`
- [ ] Morgan: activar en development (opcional)
- [ ] Error handler: verificar que en producción NO se expongan stack traces
- [ ] Validar que todas las rutas protegidas tengan `protect` middleware

### 6.3 Meta Business Verification

- [ ] Iniciar verificación de negocio en Meta Business Manager (proceso paralelo, no bloquea)
- [ ] Una vez verificada: crear plantillas de WhatsApp aprobadas para mensajes fuera de ventana 24h

### 6.4 Deploy a Render

- [ ] Crear cuenta en render.com
- [ ] Conectar repositorio de GitHub
- [ ] **Backend**: Crear Web Service
  - Build Command: `npm install`
  - Start Command: `node src/index.js`
  - Health Check Path: `/api/v1/health`
  - Plan: Free (se duerme con inactividad, se despierta con request)
- [ ] **Frontend**: Crear Static Site
  - Build Command: `npm run build`
  - Publish Directory: `dist`
- [ ] **Base de datos**: Usar Render PostgreSQL (free tier: 1GB, expira a los 90 días) o Neon (mejor alternativa free sin expiración)
- [ ] Configurar variables de entorno en el panel de Render
- [ ] Verificar que webhook de MP sea accesible desde internet (la capa gratuita de Render no tiene sleep si se usa un uptime monitor tipo cron-job.org)

---

## CHECKLIST GLOBAL

```
[x] FASE 1 — Backend Core (Auth + Productos)
[ ] FASE 2 — Frontend Base
[ ] FASE 3 — Carrito + Checkout + Mercado Pago
[ ] FASE 4 — Notificaciones (WhatsApp + Mail + PDF)
[ ] FASE 5 — Panel de Administración
[ ] FASE 6 — Producción y Deploy
```

---

## Convenciones para cada tarea

Al implementar cada tarea seguir estas reglas:
1. **Patrón de capas**: Route → Middleware/Validation → Controller → Service → Model
2. **Archivos**: `camelCase.js` para services/controllers/routes, `PascalCase.js` para modelos
3. **Validación Zod**: Todo endpoint con body usa validateMiddleware
4. **Error handling**: Usar `catchAsync` + `AppError` desde services
5. **Env**: Nunca `process.env.X` directo, siempre `envs.X` desde `config/enviroments/enviroments.js`
6. **Semantic commits**: `feat:`, `fix:`, `refactor:`, `docs:`, etc.

---

## Testing

Cada módulo tiene su propio archivo de tests siguiendo el patrón del proyecto PharmBot.
No se usa framework de testing — vanilla Node.js con helper `callHandler()`.

### Archivos

```
Backend/src/
├── test-utils.js        # Helpers: callHandler, ok, fallo, rechazo, printResumen
├── test-auth.js         # Tests de auth
├── test-products.js     # Tests de productos
├── test-orders.js       # Tests de órdenes
├── test-payments.js     # Tests de Mercado Pago
├── test-notifications.js  # Tests de WhatsApp + mail + PDF
└── test-runner.js       # Orquestador que importa y corre todos los suites
```

### `test-utils.js` — Helpers compartidos

```js
let positivos = 0;
let negativos = 0;
let errores = 0;

export function resetCounters() { positivos = 0; negativos = 0; errores = 0; }

export function ok(label) { positivos++; console.log(`  ✅ ${label}`); }

export function rechazo(label) { negativos++; console.log(`  ✅ [NEGATIVO] ${label}`); }

export function fallo(label, detalle) {
  errores++;
  console.log(`  ❌ [FALLO] ${label}${detalle ? " — " + String(detalle) : ""}`);
}

export function printResumen() {
  console.log(`\n✅ ${positivos} positivos | ✅ ${negativos} negativos | ❌ ${errores} errores\n`);
  if (errores > 0) process.exit(1);
}

export function callHandler(handler, body = {}, query = {}) {
  return new Promise((resolve) => {
    const req = { body, query };
    const wrapper = {
      statusCode: 200,
      body: undefined,
      status(code) { wrapper.statusCode = code; return wrapper; },
      send(data) { wrapper.body = data; resolve({ statusCode: wrapper.statusCode, body: wrapper.body }); return wrapper; },
      json(data) { wrapper.body = data; resolve({ statusCode: wrapper.statusCode, body: wrapper.body }); return wrapper; },
      sendStatus(code) { wrapper.statusCode = code; resolve({ statusCode: wrapper.statusCode, body: wrapper.body }); return wrapper; },
    };
    handler(req, wrapper, () => {});
  });
}
```

### Cuándo y cómo escribir tests

- **Cada vez que se completa un módulo** (model + service + controller + routes) se crea o extiende su archivo de test.
- **Casos positivos**: flujo feliz (registro exitoso, producto creado, orden generada).
- **Casos negativos**: validaciones (campos faltantes, roles incorrectos, duplicados, UUID inválido).
- **Casos de borde**: idempotencia, concurrencia, datos vacíos.
- Se corre con `npm test` (ejecuta `test-runner.js` que importa todos los suites).

### Script en package.json

```json
"test": "node src/test-runner.js"
```

### Tests por módulo

| Archivo | Lo que testea | Ejemplos de casos |
|---------|--------------|-------------------|
| `test-auth.js` | register, login, profile, cambio password | ✅ registro con acceptedTerms=true, ❌ registro sin acceptedTerms, ❌ login con password incorrecta |
| `test-products.js` | CRUD productos, filtros, permisos | ✅ crear producto como admin, ❌ crear producto sin token, ✅ filtrar por precio |
| `test-orders.js` | creación de orden, orderNumber, estados | ✅ crear orden con items, ✅ orderNumber formato NT-000001, ❌ crear orden sin items |
| `test-payments.js` | createPreference, webhook, idempotencia | ✅ webhook recibe notificación y cambia a paid, ✅ webhook duplicado no re-procesa, ❤ webhook con firma inválida |
| `test-notifications.js` | WhatsApp, mail, PDF | ✅ sendOwnerAlert genera mensaje correcto, ✅ generateReceipt crea PDF, ❌ enviar sin WHATSAPP_TOKEN |

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
  - `imageUrl` / `isActive`
  - `stock` se maneja por variante (`ProductVariant.stock`)

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

- [x] **`seeders/adminSeeder.js`** — Crea admin por defecto
- [x] **`seeders/productSeeder.js`** — Crea 8 productos con variantes de color
- [x] Script `"seed": "node seeders/adminSeeder.js && node seeders/productSeeder.js"` en package.json

### 1.9 Variantes — Modelo ProductVariant

- [ ] **`models/productVariantModel.js`** — Variante con:
  - `id: UUID, PK`
  - `productId: UUID, FK -> Products, allowNull: false`
  - `color: STRING, allowNull: false` — nombre del color (ej: "Negro", "Blanco")
  - `colorHex: STRING, allowNull: false` — código hexadecimal (ej: "#000000")
  - `imageUrl: STRING, allowNull: true` — imagen específica de la variante
  - `stock: INTEGER, allowNull: false, defaultValue: 0`
  - timestamps
- [ ] Migrar `stock` de `Product` a `ProductVariant` (el stock en Product queda como 0 o se elimina)
- [ ] Agregar asociación: `Product.hasMany(ProductVariant)`, `ProductVariant.belongsTo(Product)`

### 1.10 Variantes — Validaciones Zod

- [ ] **`schemas/product.schema.js`** — Agregar schemas:
  - `createVariantSchema`: productId, color, colorHex requeridos; imageUrl, stock opcionales
  - `updateVariantSchema`: partial de createVariant
  - `variantQuerySchema`: filtros por productId

### 1.11 Variantes — Service + Controller

- [ ] **`services/product.services.js`** — Agregar:
  - `getVariants(productId)` — listar variantes de un producto
  - `getVariant(id)` — buscar variante por ID
  - `createVariant(data)` — crear variante
  - `updateVariant(variant, data)` — actualizar
  - `deleteVariant(variant)` — eliminar variante
  - `decrementStock(variantId, quantity)` — descontar stock al pagar
- [ ] **`controllers/productController.js`** — Handlers CRUD de variantes

### 1.12 Variantes — Routes

- [ ] **`routes/productRoutes.js`** — Agregar:
  - `GET /products/:id/variants` — listar colores de un producto (público)
  - `POST /products/:id/variants` — crear variante (admin)
  - `PATCH /variants/:id` — editar variante (admin)
  - `DELETE /variants/:id` — eliminar variante (admin)
- [ ] **`test-products.js`** — Agregar tests de variantes

---

## FASE 2 — Frontend Base ✅

### 2.1 Setup del proyecto ✅

- [x] **`Frontend/`** — Vite + React creado
- [x] **Tailwind CSS v4** — Instalado y configurado con `@tailwindcss/vite`
- [x] **Proxy** — Configurado en `vite.config.js` para `/api` → `http://localhost:3000`
- [x] **Dependencias** — react-router-dom, axios, @fontsource/barlow-condensed, @fontsource-variable/inter

### 2.2 Estructura base ✅

- [x] **`src/main.jsx`** — Entry point con BrowserRouter, AuthProvider, CartProvider
- [x] **`src/App.jsx`** — Layout con Navbar + Routes + Footer
- [x] **`src/config/api.js`** — Axios con interceptor JWT
- [x] **`src/config/auth.js`** — Funciones loginRequest, registerRequest, getProfileRequest

### 2.3 Auth context ✅

- [x] **`src/context/AuthContext.jsx`** — Contexto con user, token, loading, login, logout
- [x] **Estados**: carga (loading), autenticado, no autenticado

### 2.4 Páginas de Auth ✅

- [x] **`src/pages/LoginPage.jsx`** — Formulario email + password con manejo de errores
- [x] **`src/pages/RegisterPage.jsx`** — Registro promocional con mensaje de beneficios, checkboxes T&C y marketing
- [x] **Banner promocional**: "Creá tu cuenta y obtené descuentos exclusivos, ofertas y acceso a tu historial"

### 2.5 Catálogo de productos ✅

- [x] **`src/services/product.service.js`** — getProducts, getProduct, getProductVariants
- [x] **`src/pages/CatalogPage.jsx`** — Grid con loading (skeleton), empty, error states
- [x] **`src/pages/ProductDetailPage.jsx`** — Selector de colores, stock por variante, botón agregar
- [x] **`src/components/ProductCard.jsx`** — Card con imagen, nombre, precio, hover
- [x] **`src/components/ColorSelector.jsx`** — Círculos de color con colorHex
- [x] **`src/components/Navbar.jsx`** — Logo, links, carrito con badge, login/logout
- [x] **`src/components/Footer.jsx`** — Footer simple con copyright

### 2.6 Carrito

- [x] **`src/context/CartContext.jsx`** — Contexto con addItem, removeItem, updateQuantity, persistencia localStorage
- [x] **`src/pages/CartPage.jsx`** — Lista con controles de cantidad, total, estados vacío/lleno

---

## FASE 3 — Carrito + Checkout + Mercado Pago ✅

### 3.1 Carrito (client-side) ✅

- [x] **`frontend/src/context/CartContext.jsx`** — Estado del carrito con persistencia en localStorage
- [x] **`frontend/src/pages/CartPage.jsx`** — Lista con controles de cantidad, total, vacío

### 3.2 Modelo Order (backend) ✅

- [x] **`models/orderModel.js`** — Order con orderNumber, userId nullable, status, total, datos cliente
- [x] **`models/orderItemModel.js`** — OrderItem con productVariantId + color + snapshot

### 3.3 Secuencia para números de pedido ✅

- [x] Secuencia `order_numbers` en Postgres con `ensureSequence()`
- [x] `getNextOrderNumber()` formatea `NT-000001`

### 3.4 Order Service (backend) ✅

- [x] **`services/order.service.js`** — create, findById, findByOrderNumber, findByUser, updateStatus

### 3.5 Orden controller + routes ✅

- [x] **`controllers/orderController.js`** + **`routes/orderRoutes.js`**
- [x] POST /orders, GET /orders/:id, GET /orders/number/:orderNumber, GET /orders/my-orders

### 3.6 Integración Mercado Pago ✅

- [x] **`config/mercadopago.js`** — SDK inicializado con MP_ACCESS_TOKEN
- [x] **`services/payment.service.js`** — createPreference + processWebhook
- [x] **`controllers/paymentController.js`** — createPreference + webhookHandler
- [x] **`routes/paymentRoutes.js`** — POST /payments/create-preference, POST /payments/webhook
- [x] Stock: descontar de `ProductVariant.stock` al confirmar pago

### 3.7 Checkout frontend ✅

- [x] **`pages/CheckoutPage.jsx`** — Formulario datos + resumen carrito, abre MP en pestaña nueva
- [x] **`pages/PaymentResultPage.jsx`** — Polling hasta que la orden pasa a paid
- [x] **`pages/OrderSuccessPage.jsx`** — Confirmación con número de pedido

---

## FASE 4 — Notificaciones: Mail + PDF + WhatsApp ✅

### 4.1 Alerta al dueño por mail

- [ ] **`services/mail.service.js`** — MailService:
  - `sendOwnerAlert(order)` — envía mail al dueño con detalle del pedido
    - Destinatario: `OWNER_EMAIL` desde env
    - Asunto: "🛒 Nuevo pedido NT-000001 de Juan Perez"
    - Body: número de pedido, productos (con color), cantidades, total, datos del cliente

### 4.2 Recibo PDF al cliente

- [ ] **`services/pdf.service.js`** — PdfService:
  - `generateReceipt(order)` — genera PDF con:
    - Header: "Neo Tech — Recibo de Compra"
    - Número de pedido + fecha
    - Tabla de items: producto, cantidad, precio unitario, subtotal
    - Total
    - Datos del emprendimiento
  - Devuelve: `Uint8Array` (buffer del PDF)

### 4.3 Envío de recibo por mail al cliente

- [ ] **`config/mailer.js`** — Transporter de Nodemailer (SMTP)
- [ ] En `mail.service.js`:
  - `sendReceipt(order, pdfBuffer)` — envía mail al cliente con PDF adjunto
  - Asunto: "Tu pedido Neo Tech #NT-000001 fue confirmado"

### 4.4 WhatsApp: link `wa.me` en pantalla de confirmación

- [ ] **`pages/PaymentResultPage.jsx`** — Agregar botón:
  ```jsx
  <a href={`https://wa.me/${WHATSAPP_OWNER_NUMBER}?text=Hola, quiero informar mi compra. Número de pedido: ${orderNumber}`}>
    Informar mi compra por WhatsApp
  </a>
  ```
- [ ] Sin API, sin SDK, sin tokens. Link HTML simple.

### 4.5 Orquestación post-pago

- [ ] En `payment.service.js` → `processWebhook`:
  ```js
  setImmediate(async () => {
    await mailService.sendOwnerAlert(order);
    const pdfBuffer = await pdfService.generateReceipt(order);
    await mailService.sendReceipt(order, pdfBuffer);
  });
  ```
- [ ] Garantizar idempotencia: checkear `order.status !== "paid"` antes de procesar

### 4.6 Variables de entorno necesarias

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuemail@gmail.com
SMTP_PASS=contraseña_de_aplicacion
MAIL_FROM=tuemail@gmail.com
OWNER_EMAIL=email_del_dueno@gmail.com
WHATSAPP_OWNER_NUMBER=54911XXXXXXXX
```

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
  - Botón "Ver variantes" por producto
- [ ] **`frontend/src/pages/admin/ProductFormPage.jsx`** — Formulario:
  - Nombre, descripción, precio
  - Subida de imagen (drag & drop con preview)
  - Estado activo/inactivo
  - Gestión de variantes: tabla inline para agregar/editar colores con imagen y stock
- [ ] **`frontend/src/pages/admin/VariantFormPage.jsx`** — Formulario de variante:
  - Color (nombre), colorHex (selector de color o input), imagen, stock
- [ ] **`frontend/src/pages/admin/OrderListPage.jsx`** — Lista de pedidos:
  - Filtro por estado
  - Detalle al hacer click (incluye color de cada item)
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
- [ ] Error handler: verificar que en producción NO se expongan stack traces
- [ ] Validar que todas las rutas protegidas tengan `protect` middleware

### 6.3 Deploy a Render

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
[x] FASE 2 — Frontend Base
[x] FASE 3 — Carrito + Checkout + Mercado Pago
[x] FASE 4 — Notificaciones (Mail + PDF + WhatsApp)
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
| `test-products.js` | CRUD productos, variantes, filtros | ✅ crear producto + variante, ✅ listar colores, ❌ crear variante sin colorHex |
| `test-orders.js` | creación de orden, orderNumber, estados | ✅ crear orden con items, ✅ orderNumber formato NT-000001, ❌ crear orden sin items |
| `test-payments.js` | createPreference, webhook, idempotencia | ✅ webhook recibe notificación y cambia a paid, ✅ webhook duplicado no re-procesa, ❤ webhook con firma inválida |
| `test-notifications.js` | WhatsApp, mail, PDF | ✅ sendOwnerAlert genera mensaje correcto, ✅ generateReceipt crea PDF, ❌ enviar sin WHATSAPP_TOKEN |

---

# FASE 7+ — Requerimientos del cliente

Relevamiento de 12 requerimientos nuevos. Cada fase se implementa, se testea (integrado + manual), se commitea con Semantic Commits y se pushea a `dev`. Al cerrar todas las fases, `dev` se mergea a `main` para deploy.

## Decisiones acordadas

- **Marca:** "LIER" en el copyright del footer es correcta y NO se toca. El `NEO TECH` del navbar/footer es la marca de la tienda.
- **Buscador:** en mobile (lupa) y desktop (input), solo por nombre, navega a `/products?search=`.
- **Dark mode:** incluye storefront y admin; default según sistema operativo con toggle persistido. Paleta: `#043f51` fondo, `#192734` superficies/tarjetas, `#bcff7b` acento.
- **Tests frontend:** se agrega Vitest + React Testing Library como devDependencies.
- **Stock:** se agrega `stock` al producto base. `ProductVariant.stock` sigue existiendo. "Última unidad" cuando el stock disponible es 1.
- **Color base:** `color` y `colorHex` opcionales en `Product`; la imagen del color base es `product.imageUrl`.
- **Descuentos masivos:** se implementan como campaña con nombre y productos asociados, para poder quitarlos en bloque. Pisan descuentos individuales con aviso.
- **Códigos:** descuentan sobre el total del carrito, se combinan con descuentos de producto (sobre el precio ya descontado), un código por pedido, guest permitido, vencimiento desde la creación, usos globales, se consumen al confirmar el pago con revalidación, prorrateo en los `unit_price` de Mercado Pago.
- **Imagen en resumen:** se muestra en la pantalla de pedido confirmado y en el detalle admin. En PDF solo si es JPG/PNG (si es WebP se omite). Mail sin cambios.
- **Video:** bloque full-width arriba del hero, autoplay/muted/loop/sin controles, MP4 hasta 25 MB, switch independiente, poster/fallback, `prefers-reduced-motion`.
- **Configuración:** tabla `Settings` singleton (video, logo y futuros ajustes).
- **Tests backend:** se mantiene el runner casero y se agregan suites.
- **DB de test:** `.env.test` con base separada; los tests nunca corren si `NODE_ENV=production`.
- **Git:** rama `feature/*` por fase desde `dev`, merge a `dev`; al final `dev` → `main`.
- **Esquema:** se empieza a usar migraciones Sequelize para los cambios de esta etapa en lugar de `sync({ alter: true })`.

## Fases

### Fase A — Búsquedas y UI de bajo riesgo

**Requerimientos:** 1, 5, 6, 7, 11.

- [x] Buscador en navbar: lupa en mobile, input en desktop. Envía a `/products?search=`.
- [x] Buscador en gestión de productos admin (debounce, server-side).
- [x] Logo real `Frontend/public/logo.png` en navbar, footer y placeholders de producto.
- [x] Cartel "Última unidad" cuando el stock disponible es 1 (variante seleccionada o producto base).
- [x] Cartel de descuento consistente en carrito, mini-carrito y checkout (precio tachado + % OFF).

**Tests integrados (frontend):**
- Navbar mobile: abrir lupa, escribir y navegar con `search`.
- AdminProducts: la búsqueda llama a la API con `search` y renderiza resultados.
- ProductCard: muestra "Última unidad" con stock 1 y no lo muestra con stock 2.
- CartPage/MiniCart: muestra precio original tachado y precio final con descuento.
- Placeholder: producto sin imagen renderiza el logo local, no `placehold.co`.

**Prueba manual:** mobile y desktop; búsqueda con y sin resultados; producto sin imagen; producto con stock 1; producto con descuento agregado al carrito.

**Criterio de aceptación:** no queda ninguna referencia a `placehold.co`; la búsqueda funciona desde cualquier página; lint y build sin errores.

### Fase B — Dark mode

**Requerimiento:** 2.

- [x] Tokens dark en `index.css` + `@custom-variant dark` (Tailwind v4).
- [x] Toggle en navbar (desktop y mobile), persistencia en `localStorage`, default según sistema.
- [x] Sin flash inicial (script inline antes de React).
- [x] Barrido de `bg-white` y colores hardcodeados en storefront y admin.
- [x] Logo `logo_dark` automático en modo oscuro.

**Tests integrados:** toggle cambia la clase `dark`, persiste y respeta `prefers-color-scheme`.

**Prueba manual:** todas las pantallas del storefront y admin en claro/oscuro, incluyendo modales, toasts, skeletons y estados vacíos.

**Criterio de aceptación:** no quedan parches blancos ni texto ilegible en modo oscuro.

### Fase C — Datos de producto y orden

**Requerimientos:** 4, 6 (parte 2), 8.

- [x] `Product.color` y `Product.colorHex` opcionales; variante "original" con color en el selector.
- [x] `Product.stock` para productos sin variantes.
- [x] `OrderItem.imageUrl` (snapshot) + imagen en confirmación de pedido, pago y detalle admin.
- [x] Migraciones Sequelize para los nuevos campos (`npm run migrate`).
- [x] Actualizar `AGENTS.md` (stock base y variantes).

**Tests integrados (backend):** producto con color base; orden guarda `imageUrl`; producto sin variante descuenta stock base; "última unidad" con stock base = 1.

**Prueba manual:** crear producto con color base, comprarlo y verificar imagen en el resumen y en el admin; producto sin variantes con stock 1.

**Criterio de aceptación:** órdenes nuevas muestran imagen; productos viejos usan logo de fallback.

**Datos demo:** `npm run seed:visual` crea/actualiza el admin demo, productos de prueba y un pedido pagado con imágenes. No se ejecuta en producción salvo `ALLOW_DEMO_SEED=true`.

### Fase D — Descuentos

**Requerimientos:** 3, 7, 10.

- [ ] Campaña de descuento masivo: nombre, porcentaje, vencimiento y selección múltiple de productos.
- [ ] Modelo `DiscountCode`: código, porcentaje, `maxUses`, `uses`, `expiresAt`, `isActive`.
- [ ] CRUD admin de códigos, con usos restantes y vencimiento.
- [ ] Validación de código en checkout/carrito + rate limit.
- [ ] `Order.discountCode` y `Order.discountAmount`; impacto en total, MP, mail, PDF y admin.
- [ ] Consumo de uso al confirmar pago, atómico e idempotente.
- [ ] Carteles de descuento consistentes en todas las superficies.

**Tests integrados (backend):** código válido/vencido/agotado/inexistente; un solo uso con dos órdenes concurrentes; idempotencia del webhook; total con descuento de producto + código; prorrateo en MP; campaña masiva pisa descuentos individuales.

**Prueba manual:** generar códigos de 1 y 10 usos, con 24/48/72 h; comprar como guest; verificar recibo, mail y MP; reintentar webhook.

**Criterio de aceptación:** ningún uso se consume antes del pago; no hay doble descuento ni doble mail.

### Fase E — Configuración del sitio y video

**Requerimiento:** 9.

- [ ] Modelo `Settings` singleton (`videoUrl`, `videoEnabled`, `logoUrl`).
- [ ] Upload de video a Cloudinary (`resource_type: "video"`, límite 25 MB, MIME mp4).
- [ ] Pantalla admin: subir, reemplazar, habilitar/deshabilitar.
- [ ] Home: video full-width arriba; hero debajo; sin video o deshabilitado, hero vuelve arriba.
- [ ] Poster/fallback, `muted`, `playsInline`, loop, `prefers-reduced-motion`.

**Tests integrados:** lectura pública de settings; upload rechaza formato/tamaño inválido; flag deshabilitado oculta el video.

**Prueba manual:** subir video, recargar home, verificar el layout en mobile y desktop; deshabilitar y confirmar que el hero vuelve arriba.

**Criterio de aceptación:** el home no se rompe sin video y el video no bloquea la carga del catálogo.

### Fase F — Pantalla de carga por espera de DB

**Requerimiento:** 12.

- [ ] `GET /health` (sin auth) que verifique DB.
- [ ] Splash inicial con logo y mensaje de "Despertando el servidor", reintento y timeout.
- [ ] No bloquear para siempre: ofrecer reintentar o continuar.

**Tests integrados:** health OK y health con DB caída; splash desaparece al responder y muestra reintento al agotar el timeout.

**Prueba manual:** simular cold start (backend apagado) y verificar la UX; recarga normal sin splash innecesario.

**Criterio de aceptación:** ningún usuario queda en pantalla de carga infinita.

## Flujo de trabajo por fase

1. Rama `feature/fase-x-...` desde `dev`.
2. Implementación backend/frontend.
3. Tests integrados nuevos + suite existente en verde.
4. Prueba manual con el checklist de la fase.
5. `npm run lint` (backend y frontend) y `npm run build` (frontend).
6. Commit semántico y merge a `dev`. Push de `dev`.
7. Marcar la fase como completada en este archivo.

## Checklist de fases

```
[x] Fase A - Búsquedas y UI de bajo riesgo
[x] Fase B - Dark mode
[x] Fase C - Datos de producto y orden
[ ] Fase D - Descuentos
[ ] Fase E - Configuración del sitio y video
[ ] Fase F - Pantalla de carga por espera de DB
[ ] Deploy - merge dev → main
```

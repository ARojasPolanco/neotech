# AGENTS.md — Neo Tech E-commerce

Este archivo es la fuente de verdad para cualquier agente de IA (opencode, Claude Code, Codex, etc.) que trabaje sobre este repo. Léelo completo antes de tocar código.

## Contexto del proyecto

Neo Tech es un e-commerce de productos electrónicos. El dueño necesita:
1. Vender online con carrito y pago con Mercado Pago.
2. Recibir una alerta por WhatsApp cada vez que se confirma un pago, con el detalle del pedido.
3. Que el cliente reciba un número de pedido y un recibo en PDF.
4. Un panel simple para cargar/editar productos (nombre, precio, imagen) sin tocar código.

No es un proyecto de portfolio ni un demo: va a producción real, así que priorizar simplicidad y robustez por sobre "impresionar".

## Stack fijo (no cambiar sin confirmar con el usuario)

- **Lenguaje:** JavaScript puro (ES2022+), **sin TypeScript**.
- **Backend:** Node.js + Express.
- **Validación:** Zod en todos los endpoints que reciben datos del cliente (body, query, params).
- **ORM:** Sequelize sobre PostgreSQL.
- **Frontend:** React (Vite) + Tailwind CSS.
- **Imágenes:** Cloudinary (subida desde el panel admin vía `multer` + `cloudinary` SDK).
- **Pagos:** Mercado Pago (`mercadopago` SDK) — Checkout Pro + webhook de notificaciones.
- **WhatsApp:** WhatsApp Cloud API de Meta (HTTP directo, sin SDK de terceros).
- **Mail:** Nodemailer.
- **PDF:** `pdf-lib`.
- **Auth:** JWT (access token) + bcrypt para hash de contraseñas.

## Arquitectura

Patrón de capas (similar a Clean Architecture liviana), ya usado en otros proyectos del usuario:

```
Route → Controller → Service → Model
                 ↓
            Validation (Zod)
```

- **Routes**: solo definen el endpoint y qué middlewares/controller usar. Sin lógica.
- **Controllers**: reciben `req`/`res`, llaman al service correspondiente, devuelven la respuesta HTTP. Sin lógica de negocio ni queries directas.
- **Services**: toda la lógica de negocio vive acá. Es la única capa que puede llamar a otros services (ej: `orderService` llama a `whatsappService` y `mailService`).
- **Models**: definición de Sequelize, solo estructura y relaciones. Sin lógica de negocio.
- **Validations**: un schema Zod por cada endpoint que recibe input. Se valida en un middleware antes de llegar al controller.

## Manejo de errores

El usuario tiene experiencia específica en esto — respetar el patrón:

- Un middleware global de error al final de Express.
- Errores operacionales (validación, 404, conflictos de negocio) vs errores de programación separados: crear una clase `AppError` (con `statusCode` y `isOperational`) y lanzar esa clase desde los services.
- En producción, nunca exponer stack traces ni mensajes de error internos al cliente.
- Loggear siempre el error completo en servidor (consola o archivo), aunque al cliente se le mande un mensaje genérico.

## Reglas de negocio clave

### Registro de usuarios
- **El registro NO es obligatorio para comprar.** Un guest puede completar la compra solo con nombre, email y teléfono.
- El registro se ofrece como invitación post-compra o durante el checkout, con beneficios: descuentos, ofertas, historial de pedidos.
- Si el email ya existe en `Users`, mostrar mensaje: "Ya tenés una cuenta. Iniciá sesión para ver tu historial."
- Para quienes se registren, dos checkboxes separados:
  - `acceptedTerms` (**obligatorio**, bloquea el submit si no está marcado): Términos y Condiciones + Política de Privacidad.
  - `acceptedMarketing` (**opcional**): consentimiento para recibir ofertas por mail.
- Guardar en el modelo `User` ambos campos como booleanos, más la fecha de aceptación (`termsAcceptedAt`).
- Nunca mandar mail de ofertas a un usuario con `acceptedMarketing: false`.

### Variantes de producto (colores)
- Un mismo producto puede tener múltiples variantes (ej: "iPhone 15" en Negro, Blanco, Azul).
- Cada variante tiene: `color`, `colorHex` (código hexadecimal), `imageUrl` (imagen específica), `stock` (stock individual).
- El precio es el mismo para todas las variantes y vive en el producto base (`Product.price`).
- Al mostrar un producto, el frontend debe listar los colores disponibles. Al seleccionar un color, la imagen cambia.
- En la orden (`OrderItem`) se guarda el `variantId` + `color` para que el detalle incluya el color seleccionado.
- El stock se descuenta de `ProductVariant.stock`, no de `Product.stock`.

### Números de pedido
- Formato: `NT-000001`, incremental, generado en el momento de crear la orden (no antes).
- Usar una secuencia de Postgres o un contador atómico (`SELECT ... FOR UPDATE` o secuencia nativa) para evitar duplicados con pedidos concurrentes. No generar el número con `Math.random()` ni con el `id` autoincremental crudo sin formatear.

### Flujo de pago (Mercado Pago)
1. El backend crea la orden en estado `pending` con los items del carrito.
2. Se crea una "preference" de Mercado Pago con esos items y `external_reference = orderNumber`.
3. El frontend redirige al `init_point` de Mercado Pago.
4. Mercado Pago llama al webhook (`POST /api/payments/webhook`) al confirmarse el pago.
5. El webhook valida la notificación, busca la orden por `external_reference`, actualiza el estado a `paid`.
6. Solo cuando el estado pasa a `paid` se disparan: alerta WhatsApp al dueño + generación y envío de recibo al cliente. **Nunca disparar estas acciones antes de la confirmación real del webhook.**
7. El webhook debe responder rápido (200 OK) y hacer el trabajo pesado (WhatsApp, mail, PDF) de forma asíncrona, para no arriesgar timeouts ni reintentos duplicados de Mercado Pago.
8. Idempotencia: si el webhook llega dos veces para la misma orden ya pagada, no volver a mandar WhatsApp/mail duplicados.

### Alerta al dueño por WhatsApp
- Mensaje de texto simple con: número de pedido, productos, cantidades, total, y datos de contacto del cliente.
- Usar plantillas de WhatsApp (`message templates`) aprobadas por Meta si se manda fuera de la ventana de 24hs; para notificaciones inmediatas post-pago no hace falta plantilla.
- Número destino: `WHATSAPP_OWNER_NUMBER` desde variables de entorno (no hardcodear).

### Recibo del cliente
- Generar un PDF simple: número de pedido, fecha, items, precios unitarios, total, datos del emprendimiento (Neo Tech).
- Adjuntar el PDF al mail de confirmación. Si se agrega envío por WhatsApp más adelante, mandar el PDF como documento adjunto vía Cloud API.

### Panel de administración
- Rutas protegidas con JWT + verificación de rol `admin`.
- CRUD de productos: nombre, precio, descripción corta, imagen (subida a Cloudinary), stock, estado (activo/inactivo).
- Gestión de variantes por producto: agregar/editar colores, imagen específica, stock individual por variante.
- No permitir borrar productos con pedidos asociados: solo desactivar (`isActive: false`).

## Convenciones de código

- Nomenclatura de archivos: `camelCase.js` para services/controllers, `PascalCase.js` para modelos.
- Un archivo de rutas por recurso: `products.routes.js`, `orders.routes.js`, `auth.routes.js`.
- Nunca lógica de negocio en controllers ni en rutas.
- Todo endpoint que reciba `body` pasa primero por un middleware de validación Zod específico.
- Variables de entorno siempre a través de un módulo `config/env.js` centralizado, nunca `process.env.X` disperso en el código.
- Commits siguiendo Semantic Commits (`feat:`, `fix:`, `refactor:`, `docs:`, etc.) — el usuario ya da charlas sobre esto, mantener la disciplina.

## Qué NO hacer

- No usar TypeScript ni introducir `.ts` en el proyecto.
- No hardcodear credenciales, tokens ni números de teléfono en el código.
- No mandar notificaciones de WhatsApp o mail antes de que el webhook de Mercado Pago confirme el pago.
- No usar `localStorage`/`sessionStorage` para datos sensibles del carrito si se decide persistir server-side más adelante (a definir en Fase 1 si el carrito es solo client-side o también server-side para usuarios logueados).
- No introducir dependencias nuevas grandes sin justificar por qué no alcanza con lo ya definido en el stack.

## Estado actual

Proyecto en **Fase 0 — Planeación**. Ver `README.md` para el roadmap completo por fases.

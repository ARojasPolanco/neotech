# Neo Tech — E-commerce

E-commerce simple para un emprendimiento de venta de productos electrónicos. Pensado para ir a producción real, no un demo.

## ¿Qué hace?

- Catálogo público de productos con carrito de compras.
- Registro de clientes con doble aceptación (Términos y Condiciones + Ofertas por mail), obligatoria la primera, opcional la segunda.
- Checkout que genera un pedido con número único (`NT-000001`, `NT-000002`, ...) y lo cobra con **Mercado Pago Checkout Pro**.
- Al confirmarse el pago (webhook de Mercado Pago):
  - Se le manda un **mensaje de WhatsApp automático al dueño** con el detalle del pedido (vía WhatsApp Cloud API de Meta).
  - Se le manda al cliente un **recibo en PDF** por mail (y opcionalmente por WhatsApp).
- Panel de administración privado para el dueño: alta/edición/baja de productos, subida de imagen (Cloudinary), precio, nombre, stock.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express (JavaScript, sin TS) |
| Validación | Zod |
| Base de datos | PostgreSQL + Sequelize |
| Frontend | React + Tailwind CSS |
| Imágenes | Cloudinary |
| Pagos | Mercado Pago (Checkout Pro + Webhooks) |
| Notificaciones | WhatsApp Cloud API (Meta) |
| Mail | Nodemailer (SMTP) o Resend |
| PDF | pdf-lib |
| Auth | JWT + bcrypt |

## Estructura del repo

```
neotech-ecommerce/
├── AGENTS.md              # Reglas para agentes de código (opencode, etc.)
├── CLAUDE.md              # Apunta a AGENTS.md
├── README.md              # Este archivo
├── backend/
│   ├── src/
│   │   ├── config/        # conexión DB, env, cloudinary, mercadopago, whatsapp
│   │   ├── models/        # modelos Sequelize
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/      # lógica de negocio (orders, whatsapp, mail, pdf)
│   │   ├── validations/   # schemas Zod
│   │   ├── middlewares/   # auth, error handling, upload
│   │   └── utils/
│   ├── migrations/
│   └── seeders/
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/       # CartContext, AuthContext
    │   ├── services/      # llamadas a la API
    │   └── hooks/
    └── public/
```

## Variables de entorno necesarias

```
# DB
DATABASE_URL=

# Auth
JWT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Mercado Pago
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_WEBHOOK_SECRET=

# WhatsApp Cloud API (Meta)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_OWNER_NUMBER=       # número del dueño que recibe las alertas
WHATSAPP_VERIFY_TOKEN=

# Mail
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

## Roadmap (fases de desarrollo)

- [ ] **Fase 0** — Setup del repo, docs, base de datos, migraciones iniciales.
- [ ] **Fase 1** — Backend core: auth (registro con checkboxes T&C/ofertas, login), CRUD de productos, carrito.
- [ ] **Fase 2** — Frontend: catálogo, carrito, registro/login.
- [ ] **Fase 3** — Checkout + integración Mercado Pago (preferencia + webhook).
- [ ] **Fase 4** — Integración WhatsApp Cloud API (número de prueba) + alerta al dueño.
- [ ] **Fase 5** — Generación de recibo PDF + envío por mail.
- [ ] **Fase 6** — Panel de administración (productos, imágenes, precios).
- [ ] **Fase 7** — Verificación de negocio en Meta + deploy a producción (DigitalOcean).

## Notas importantes

- El número de WhatsApp de prueba de Meta solo puede mandar mensajes a números verificados manualmente (hasta 5). Alcanza y sobra para desarrollo y para que el dueño reciba alertas antes de tener el negocio verificado.
- La verificación de negocio en Meta Business Manager puede tardar días. No bloquea el desarrollo, se gestiona en paralelo antes de la Fase 7.

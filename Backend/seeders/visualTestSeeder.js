import { envs } from "../src/config/enviroments/enviroments.js";
import sequelize from "../src/config/database/database.js";
import User from "../src/models/authModel.js";
import Product from "../src/models/productModel.js";
import ProductVariant from "../src/models/productVariantModel.js";
import Order from "../src/models/orderModel.js";
import OrderItem from "../src/models/orderItemModel.js";
import DiscountCode from "../src/models/discountCodeModel.js";
import "../src/models/associations.js";
import { encryptedPassword } from "../src/config/plugins/encrypted-password.js";
import { OrderService, ensureSequence } from "../src/services/order.service.js";

const DEMO_ADMIN_EMAIL = "admin.demo@neotech.com";
const DEMO_ADMIN_PASSWORD = "Demo1234";
const DEMO_CUSTOMER_EMAIL = "cliente.demo@neotech.com";
const DEMO_CODE_CUSTOMER_EMAIL = "cliente.codigo@neotech.com";
const DEMO_CODE = "NEO-DEMO10";

async function upsertAdmin() {
  const existing = await User.findOne({ where: { email: DEMO_ADMIN_EMAIL } });

  if (existing) {
    await existing.update({
      fullname: "Admin Demo",
      role: "ADMIN",
      status: true,
      password: await encryptedPassword(DEMO_ADMIN_PASSWORD),
    });
    return "actualizado";
  }

  await User.create({
    fullname: "Admin Demo",
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    role: "ADMIN",
    acceptedTerms: true,
    acceptedMarketing: false,
    termsAcceptedAt: new Date(),
  });

  return "creado";
}

async function upsertProduct(fields) {
  const [product, created] = await Product.findOrCreate({
    where: { slug: fields.slug },
    defaults: fields,
  });

  if (!created) {
    await product.update(fields);
  }

  return product;
}

async function upsertVariant(product, variant) {
  const existing = await ProductVariant.findOne({
    where: { productId: product.id, color: variant.color },
  });

  if (existing) {
    await existing.update(variant);
    return existing;
  }

  return ProductVariant.create({ productId: product.id, ...variant });
}

async function main() {
  if (envs.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    console.error(
      "El seeder demo no se ejecuta en producción. Usá ALLOW_DEMO_SEED=true para forzarlo.",
    );
    process.exit(1);
  }

  await sequelize.sync();
  await ensureSequence();

  const adminState = await upsertAdmin();

  const demoCodeExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const [demoCode] = await DiscountCode.findOrCreate({
    where: { code: DEMO_CODE },
    defaults: {
      discountPercent: 10,
      maxUses: 10,
      uses: 0,
      expiresAt: demoCodeExpiresAt,
      isActive: true,
    },
  });
  await demoCode.update({
    discountPercent: 10,
    maxUses: 10,
    uses: 0,
    expiresAt: demoCodeExpiresAt,
    isActive: true,
  });

  const demoImages = [
    "/demo/auriculares.png",
    "/demo/smartwatch.png",
    "/demo/parlante.png",
    "/demo/cargador.png",
    "/demo/mouse.png",
  ];
  const imageAt = (index) => demoImages[index % demoImages.length] || null;

  const baseProduct = await upsertProduct({
    name: "Auriculares Base Demo",
    slug: "demo-auriculares-base",
    description:
      "Producto sin variantes con color base y stock 1 para probar la última unidad.",
    price: 15000,
    imageUrl: imageAt(0),
    isActive: true,
    category: "Auriculares",
    subcategory: null,
    color: "Azul",
    colorHex: "#1e40af",
    stock: 1,
    discountPercent: null,
    discountExpiresAt: null,
    isFeatured: false,
  });

  const variantsProduct = await upsertProduct({
    name: "Smartwatch Demo",
    slug: "demo-smartwatch-variantes",
    description:
      "Producto con variantes de color, una con última unidad y otra sin stock.",
    price: 28000,
    imageUrl: imageAt(1),
    isActive: true,
    category: "Accesorios",
    subcategory: null,
    color: "Negro",
    colorHex: "#111827",
    stock: null,
    discountPercent: null,
    discountExpiresAt: null,
    isFeatured: false,
  });

  await upsertVariant(variantsProduct, {
    color: "Negro",
    colorHex: "#111827",
    stock: 1,
    imageUrl: imageAt(1),
  });
  await upsertVariant(variantsProduct, {
    color: "Blanco",
    colorHex: "#ffffff",
    stock: 5,
    imageUrl: null,
  });
  await upsertVariant(variantsProduct, {
    color: "Rojo",
    colorHex: "#ef4444",
    stock: 0,
    imageUrl: null,
  });

  const discountProduct = await upsertProduct({
    name: "Parlante Demo 25% OFF",
    slug: "demo-parlante-descuento",
    description:
      "Producto con descuento activo para probar el cartel y el precio tachado.",
    price: 20000,
    imageUrl: imageAt(2),
    isActive: true,
    category: "Parlantes",
    subcategory: null,
    color: "Gris",
    colorHex: "#6b7280",
    stock: 4,
    discountPercent: 25,
    discountExpiresAt: null,
    isFeatured: true,
  });

  await upsertProduct({
    name: "Funda Demo Sin Imagen",
    slug: "demo-funda-sin-imagen",
    description:
      "Producto sin imagen para ver el logo de marca como placeholder.",
    price: 5000,
    imageUrl: null,
    isActive: true,
    category: "Fundas",
    subcategory: "iPhone 15",
    color: null,
    colorHex: null,
    stock: null,
    discountPercent: null,
    discountExpiresAt: null,
    isFeatured: false,
  });

  await upsertProduct({
    name: "Cargador Demo Agotado",
    slug: "demo-cargador-agotado",
    description: "Producto con stock 0 para probar el estado sin stock.",
    price: 9000,
    imageUrl: imageAt(3),
    isActive: true,
    category: "Cargadores",
    subcategory: null,
    color: "Blanco",
    colorHex: "#ffffff",
    stock: 0,
    discountPercent: null,
    discountExpiresAt: null,
    isFeatured: false,
  });

  await upsertProduct({
    name: "Mouse Demo Descuento Vencido",
    slug: "demo-mouse-descuento-vencido",
    description:
      "Producto con descuento vencido: no debe mostrar el cartel de oferta.",
    price: 12000,
    imageUrl: imageAt(4),
    isActive: true,
    category: "Accesorios",
    subcategory: null,
    color: null,
    colorHex: null,
    stock: 6,
    discountPercent: 30,
    discountExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isFeatured: false,
  });

  const oldOrders = await Order.findAll({
    where: { customerEmail: DEMO_CUSTOMER_EMAIL },
  });

  for (const oldOrder of oldOrders) {
    await OrderItem.destroy({ where: { orderId: oldOrder.id }, force: true });
    await oldOrder.destroy({ force: true });
  }

  const orderService = new OrderService();
  const order = await orderService.create({
    customerName: "Cliente Demo",
    customerEmail: DEMO_CUSTOMER_EMAIL,
    customerPhone: "5491112345678",
    items: [
      {
        productId: baseProduct.id,
        productName: baseProduct.name,
        quantity: 1,
      },
      {
        productId: variantsProduct.id,
        variantId: (
          await ProductVariant.findOne({
            where: { productId: variantsProduct.id, color: "Negro" },
          })
        ).id,
        productName: variantsProduct.name,
        quantity: 1,
      },
    ],
  });

  await order.update({ status: "paid" });

  const oldCodeOrders = await Order.findAll({
    where: { customerEmail: DEMO_CODE_CUSTOMER_EMAIL },
  });

  for (const oldCodeOrder of oldCodeOrders) {
    await OrderItem.destroy({ where: { orderId: oldCodeOrder.id }, force: true });
    await oldCodeOrder.destroy({ force: true });
  }

  const codeOrder = await orderService.create({
    customerName: "Cliente Código Demo",
    customerEmail: DEMO_CODE_CUSTOMER_EMAIL,
    customerPhone: "5491112345678",
    discountCode: DEMO_CODE,
    items: [
      {
        productId: baseProduct.id,
        productName: baseProduct.name,
        quantity: 1,
      },
    ],
  });

  console.log("\n=== Datos demo listos ===\n");
  console.log(`Admin (${adminState}): ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
  console.log(`Producto base + stock 1: ${baseProduct.name}`);
  console.log(`  http://localhost:5173/products/${baseProduct.id}`);
  console.log(`Producto con variantes: ${variantsProduct.name}`);
  console.log(`  http://localhost:5173/products/${variantsProduct.id}`);
  console.log(`Producto con descuento: ${discountProduct.name}`);
  console.log(`  http://localhost:5173/products/${discountProduct.id}`);
  console.log(`Pedido demo pagado: ${order.orderNumber}`);
  console.log(`  http://localhost:5173/orders/${order.orderNumber}`);
  console.log(`Código demo: ${DEMO_CODE} (10% OFF, 10 usos, 72 h)`);
  console.log(`Pedido demo con código (pendiente): ${codeOrder.orderNumber}`);
  console.log(`  http://localhost:5173/orders/${codeOrder.orderNumber}`);
  console.log(`  Admin pedidos: http://localhost:5173/admin/orders`);
  console.log(`  Admin descuentos: http://localhost:5173/admin/discounts`);
  console.log("");

  process.exit(0);
}

main().catch((error) => {
  console.error("Visual seeder failed:", error);
  process.exit(1);
});

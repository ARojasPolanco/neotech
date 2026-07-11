import { ok, rechazo, fallo, callHandler, resetCounters, printResumen } from "./test-utils.js";
import { createOrder, getOrder } from "./controllers/orderController.js";
import Order from "./models/orderModel.js";
import OrderItem from "./models/orderItemModel.js";
import Product from "./models/productModel.js";
import ProductVariant from "./models/productVariantModel.js";
import "./models/associations.js";
import sequelize from "./config/database/database.js";
import { ensureSequence } from "./services/order.service.js";

let product, variant, createdId;

export async function runOrderTests() {
  resetCounters();
  console.log("\n--- Order Tests ---\n");

  await sequelize.sync({ alter: true });
  await ensureSequence();

  product = await Product.create({
    name: "Test Product",
    slug: "test-product",
    price: 100,
  });

  variant = await ProductVariant.create({
    productId: product.id,
    color: "Negro",
    colorHex: "#000000",
    stock: 10,
  });

  // ── POSITIVOS ──

  const createRes = await callHandler(createOrder, {
    customerName: "Juan Perez",
    customerEmail: "juan@test.com",
    customerPhone: "5491112345678",
    items: [
      {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        color: variant.color,
        unitPrice: Number(product.price),
        quantity: 2,
      },
    ],
  });

  if (createRes.statusCode === 201 && createRes.body.orderNumber) {
    ok(`Order created: ${createRes.body.orderNumber}`);
    createdId = createRes.body.id;
    const num = createRes.body.orderNumber;
    if (/^NT-\d{6}$/.test(num)) {
      ok(`Order number format valid: ${num}`);
    } else {
      fallo("Order number format invalid", num);
    }
  } else {
    fallo("Create order failed", createRes.body);
  }

  const getRes = await callHandler(getOrder, {}, {}, { id: createdId });

  if (getRes.statusCode === 200 && getRes.body.id === createdId) {
    ok("Get order by ID returns correct order");
  } else {
    fallo("Get order by ID failed", getRes.body);
  }

  // ── NEGATIVOS ──

  const noCustomer = await callHandler(createOrder, {
    items: [{ productId: product.id }],
  });

  if (noCustomer.statusCode === 400) {
    rechazo("Create order without customer data rejected");
  } else {
    fallo("Create order without customer should return 400", noCustomer.body);
  }

  const emptyCart = await callHandler(createOrder, {
    customerName: "Test",
    customerEmail: "test@test.com",
    customerPhone: "5491112345678",
    items: [],
  });

  if (emptyCart.statusCode === 400) {
    rechazo("Create order with empty cart rejected");
  } else {
    fallo("Create order with empty cart should return 400", emptyCart.body);
  }

  // Cleanup
  await OrderItem.destroy({ where: { orderId: createdId }, force: true });
  await Order.destroy({ where: { id: createdId }, force: true });
  await ProductVariant.destroy({ where: { id: variant.id }, force: true });
  await Product.destroy({ where: { id: product.id }, force: true });

  printResumen();
}

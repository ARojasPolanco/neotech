import {
  ok,
  rechazo,
  fallo,
  resetCounters,
  printResumen,
} from "./test-utils.js";
import sequelize from "./config/database/database.js";
import DiscountCode from "./models/discountCodeModel.js";
import DiscountCampaign from "./models/discountCampaignModel.js";
import DiscountCampaignProduct from "./models/discountCampaignProductModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";
import OrderItem from "./models/orderItemModel.js";
import "./models/associations.js";
import { ensureSequence, OrderService } from "./services/order.service.js";
import { DiscountService } from "./services/discount.service.js";
import { buildPreferenceItems } from "./services/payment.service.js";

export async function runDiscountTests() {
  resetCounters();
  console.log("\n--- Discount Tests ---\n");

  await sequelize.sync({ alter: true });
  await ensureSequence();

  const discountService = new DiscountService();
  const orderService = new OrderService();
  const stamp = Date.now();

  const product = await Product.create({
    name: "Discount Product",
    slug: `discount-product-${stamp}`,
    price: 1000,
    isActive: true,
  });

  const product2 = await Product.create({
    name: "Campaign Product",
    slug: `campaign-product-${stamp}`,
    price: 500,
    isActive: true,
  });

  const code = await discountService.createCode({
    discountPercent: 10,
    maxUses: 1,
    expiresInHours: 24,
  });

  if (code.code && Number(code.maxUses) === 1) {
    ok(`Discount code created: ${code.code}`);
  } else {
    fallo("Discount code creation failed", code);
  }

  const validated = await discountService.validateCode(code.code.toLowerCase());

  if (
    validated.discountPercent === 10 &&
    validated.usesLeft === 1 &&
    validated.code === code.code
  ) {
    ok("Discount code validated case-insensitively");
  } else {
    fallo("Discount code validation failed", validated);
  }

  const order = await orderService.create({
    customerName: "Discount Test",
    customerEmail: "discount@test.com",
    customerPhone: "5491112345678",
    discountCode: code.code,
    items: [
      {
        productId: product.id,
        productName: product.name,
        quantity: 2,
      },
    ],
  });

  if (
    Number(order.subtotal) === 2000 &&
    Number(order.discountAmount) === 200 &&
    Number(order.total) === 1800 &&
    order.discountCode === code.code
  ) {
    ok("Order applies the discount code to the total");
  } else {
    fallo("Order discount calculation failed", order);
  }

  const preferenceItems = buildPreferenceItems(order);
  const preferenceTotal = preferenceItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  if (Math.round(preferenceTotal * 100) === 180000) {
    ok("Mercado Pago items sum the discounted total");
  } else {
    fallo("Mercado Pago proration failed", preferenceTotal);
  }

  const firstConsume = await discountService.consumeCode(code.id);
  const secondConsume = await discountService.consumeCode(code.id);
  await code.reload();

  if (firstConsume === true && secondConsume === false && Number(code.uses) === 1) {
    ok("Discount code consumed exactly once under concurrency");
  } else {
    fallo("Discount code consumption is not atomic", {
      firstConsume,
      secondConsume,
      uses: code.uses,
    });
  }

  try {
    await discountService.validateCode(code.code);
    fallo("Exhausted code should be rejected");
  } catch (err) {
    if (err.statusCode === 409) {
      rechazo("Exhausted code rejected");
    } else {
      fallo("Unexpected error validating exhausted code", err.message);
    }
  }

  const expiredCode = await DiscountCode.create({
    code: `NEO-EXP${stamp.toString().slice(-6)}`,
    discountPercent: 10,
    maxUses: 1,
    expiresAt: new Date(Date.now() - 60 * 1000),
  });

  try {
    await discountService.validateCode(expiredCode.code);
    fallo("Expired code should be rejected");
  } catch (err) {
    if (err.statusCode === 410) {
      rechazo("Expired code rejected");
    } else {
      fallo("Unexpected error validating expired code", err.message);
    }
  }

  try {
    await discountService.validateCode("NEO-NOEXISTE");
    fallo("Unknown code should be rejected");
  } catch (err) {
    if (err.statusCode === 404) {
      rechazo("Unknown code rejected");
    } else {
      fallo("Unexpected error validating unknown code", err.message);
    }
  }

  const campaign = await discountService.createCampaign({
    name: "Test Campaign",
    discountPercent: 20,
    expiresAt: null,
    productIds: [product.id, product2.id],
  });

  await product.reload();
  await product2.reload();

  if (
    Number(product.discountPercent) === 20 &&
    Number(product2.discountPercent) === 20
  ) {
    ok("Campaign applies the discount to selected products");
  } else {
    fallo("Campaign product update failed", {
      first: product.discountPercent,
      second: product2.discountPercent,
    });
  }

  await discountService.endCampaign(campaign.id);
  await product.reload();
  await product2.reload();

  if (product.discountPercent === null && product2.discountPercent === null) {
    ok("Ending a campaign clears the product discounts");
  } else {
    fallo("Campaign cleanup failed", {
      first: product.discountPercent,
      second: product2.discountPercent,
    });
  }

  await OrderItem.destroy({ where: { orderId: order.id }, force: true });
  await Order.destroy({ where: { id: order.id }, force: true });
  await DiscountCampaignProduct.destroy({
    where: { campaignId: campaign.id },
    force: true,
  });
  await DiscountCampaign.destroy({ where: { id: campaign.id }, force: true });
  await DiscountCode.destroy({
    where: { id: [code.id, expiredCode.id] },
    force: true,
  });
  await Product.destroy({
    where: { id: [product.id, product2.id] },
    force: true,
  });

  printResumen();
}

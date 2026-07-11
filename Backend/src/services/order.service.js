import sequelize from "../config/database/database.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";

async function getNextOrderNumber() {
  const [result] = await sequelize.query(
    "SELECT nextval('order_numbers') as num",
  );
  const num = result[0].num;
  return `NT-${String(num).padStart(6, "0")}`;
}

export class OrderService {
  async create({ customerName, customerEmail, customerPhone, items, userId }) {
    const orderNumber = await getNextOrderNumber();

    const verifiedItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive) {
        throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      }

      let variant = null;
      if (item.variantId) {
        variant = await ProductVariant.findByPk(item.variantId);
        if (!variant || variant.productId !== product.id) {
          throw new Error(`VARIANT_NOT_FOUND:${item.variantId}`);
        }
      }

      verifiedItems.push({
        productId: product.id,
        productVariantId: variant?.id || null,
        productName: product.name,
        color: variant?.color || item.color || null,
        unitPrice: Number(product.price),
        quantity: Number(item.quantity),
        subtotal: Number(product.price) * Number(item.quantity),
      });
    }

    const total = verifiedItems.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      orderNumber,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      total,
    });

    const orderItems = verifiedItems.map((item) => ({
      orderId: order.id,
      ...item,
    }));

    await OrderItem.bulkCreate(orderItems);

    return await Order.findByPk(order.id, {
      include: [{ model: OrderItem }],
    });
  }

  async findById(id) {
    return await Order.findByPk(id, {
      include: [{ model: OrderItem }],
    });
  }

  async findByOrderNumber(number) {
    return await Order.findOne({
      where: { orderNumber: number },
      include: [{ model: OrderItem }],
    });
  }

  async findByUser(userId) {
    return await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem }],
      order: [["createdAt", "DESC"]],
    });
  }

  async updateStatus(order, status) {
    return await order.update({ status });
  }
}

export async function ensureSequence() {
  await sequelize.query(
    "CREATE SEQUENCE IF NOT EXISTS order_numbers START 1",
  );
}

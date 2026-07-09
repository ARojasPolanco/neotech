import sequelize from "../config/database/database.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";

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
    const total = items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const order = await Order.create({
      orderNumber,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone,
      total,
    });

    const orderItems = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productVariantId: item.variantId || null,
      productName: item.productName,
      color: item.color || null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: Number(item.unitPrice) * item.quantity,
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

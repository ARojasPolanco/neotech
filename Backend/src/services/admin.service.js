import cloudinary from "../config/cloudinary.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import OrderItem from "../models/orderItemModel.js";
import User from "../models/authModel.js";

export class AdminService {
  async uploadImage(fileBuffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "neotech",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );
      stream.end(fileBuffer);
    });
  }

  async getStats() {
    const [totalProducts, activeProducts, totalOrders, pendingOrders, revenue] =
      await Promise.all([
        Product.count(),
        Product.count({ where: { isActive: true } }),
        Order.count(),
        Order.count({ where: { status: "pending" } }),
        Order.sum("total", { where: { status: "paid" } }),
      ]);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: Number(revenue || 0),
    };
  }

  async getOrders({ page = 1, limit = 20, status } = {}) {
    const where = {};
    if (status) where.status = status;

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem },
        { model: User, attributes: ["id", "fullname", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return { orders: rows, total: count, page, totalPages: Math.ceil(count / limit) };
  }

  async getOrderById(id) {
    return await Order.findByPk(id, {
      include: [
        { model: OrderItem },
        { model: User, attributes: ["id", "fullname", "email"] },
      ],
    });
  }
}

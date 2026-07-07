import Product from "../models/productModel.js";
import { Op } from "sequelize";

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export class ProductService {
  async findAll(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        where.price[Op.gte] = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        where.price[Op.lte] = filters.priceMax;
      }
    }

    return await Product.findAll({ where, order: [["createdAt", "DESC"]] });
  }

  async findById(id) {
    return await Product.findOne({ where: { id } });
  }

  async findBySlug(slug) {
    return await Product.findOne({ where: { slug, isActive: true } });
  }

  async create(data) {
    const slug = generateSlug(data.name);
    return await Product.create({ ...data, slug });
  }

  async update(product, data) {
    const payload = { ...data };
    if (data.name) {
      payload.slug = generateSlug(data.name);
    }
    return await product.update(payload);
  }

  async disable(product) {
    return await product.update({ isActive: false });
  }
}

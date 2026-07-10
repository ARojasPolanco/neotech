import Product from "../models/productModel.js";
import ProductVariant from "../models/productVariantModel.js";
import { Op, Sequelize } from "sequelize";

function generateSlug(name) {
  const base = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
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

  async findByIdWithVariants(id) {
    return await Product.findOne({
      where: { id },
      include: [{ model: ProductVariant }],
    });
  }

  async findBySlug(slug) {
    return await Product.findOne({ where: { slug, isActive: true } });
  }

  async findFeatured(limit = 6) {
    return await Product.findAll({
      where: { isActive: true },
      order: Sequelize.literal("RANDOM()"),
      limit,
    });
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

  // ── Variant methods ──

  async getVariants(productId) {
    return await ProductVariant.findAll({ where: { productId } });
  }

  async getVariant(id) {
    return await ProductVariant.findOne({ where: { id } });
  }

  async createVariant(productId, data) {
    return await ProductVariant.create({ ...data, productId });
  }

  async updateVariant(variant, data) {
    return await variant.update(data);
  }

  async deleteVariant(variant) {
    return await variant.destroy();
  }

  async decrementVariantStock(variantId, quantity) {
    const variant = await this.getVariant(variantId);
    if (!variant) throw new Error("Variant not found");
    if (variant.stock < quantity) throw new Error("Insufficient stock");
    return await variant.decrement("stock", { by: quantity });
  }
}

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

function buildDiscountInfo(product) {
  const plain = product.toJSON ? product.toJSON() : { ...product };
  const price = Number(plain.price);

  if (
    plain.discountPercent &&
    Number(plain.discountPercent) > 0 &&
    (!plain.discountExpiresAt || new Date(plain.discountExpiresAt) > new Date())
  ) {
    const pct = Number(plain.discountPercent);
    plain.discountedPrice = Math.round(price * (1 - pct / 100));
    plain.discountActive = true;
  } else {
    plain.discountedPrice = null;
    plain.discountActive = false;
  }

  return plain;
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

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.subcategory) {
      where.subcategory = filters.subcategory;
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

    const options = { where, order: [["createdAt", "DESC"]] };

    if (filters.includeVariants) {
      options.include = [{ model: ProductVariant }];
    }

    const products = await Product.findAll(options);
    return products.map(buildDiscountInfo);
  }

  async findById(id) {
    return await Product.findOne({ where: { id } });
  }

  async findByIdForClient(id) {
    const product = await Product.findOne({ where: { id } });
    return product ? buildDiscountInfo(product) : null;
  }

  async findByIdWithVariants(id) {
    const product = await Product.findOne({
      where: { id },
      include: [{ model: ProductVariant }],
    });
    return product ? buildDiscountInfo(product) : null;
  }

  async findBySlug(slug) {
    return await Product.findOne({ where: { slug, isActive: true } });
  }

  async findFeatured(limit = 6) {
    const products = await Product.findAll({
      where: { isActive: true },
      include: [{ model: ProductVariant }],
      order: Sequelize.literal("RANDOM()"),
      limit,
    });
    return products.map(buildDiscountInfo);
  }

  async setFeatured(productId, data) {
    if (data.isFeatured === true) {
      await Product.update({ isFeatured: false }, { where: { isFeatured: true } });
    }

    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");

    const payload = {};
    if (data.isFeatured !== undefined) payload.isFeatured = data.isFeatured;
    if (data.discountPercent !== undefined) payload.discountPercent = data.discountPercent;
    if (data.discountExpiresAt !== undefined) payload.discountExpiresAt = data.discountExpiresAt;
    if (data.subcategory !== undefined) payload.subcategory = data.subcategory;

    await product.update(payload);
    return buildDiscountInfo(product);
  }

  async getFeaturedHighlight() {
    const product = await Product.findOne({
      where: { isFeatured: true, isActive: true },
      include: [{ model: ProductVariant }],
    });

    if (!product) return null;
    return buildDiscountInfo(product);
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

  async permanentDelete(product) {
    const { default: OrderItem } = await import("../models/orderItemModel.js");
    const { default: ProductVariant } = await import("../models/productVariantModel.js");

    const variantIds = await ProductVariant.findAll({
      where: { productId: product.id },
      attributes: ["id"],
    }).then((vs) => vs.map((v) => v.id));

    const hasOrders = await OrderItem.count({
      where: { productId: product.id },
    });

    const hasVariantOrders = variantIds.length > 0
      ? await OrderItem.count({
          where: { productVariantId: variantIds },
        })
      : 0;

    if (hasOrders > 0 || hasVariantOrders > 0) {
      throw new Error("PRODUCT_HAS_ORDERS");
    }

    await ProductVariant.destroy({ where: { productId: product.id } });
    return await product.destroy();
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

  async getSubcategories(category) {
    const results = await Product.findAll({
      where: { category, subcategory: { [Op.ne]: null }, isActive: true },
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("subcategory")), "subcategory"]],
      raw: true,
    });
    return results.map((r) => r.subcategory).filter(Boolean).sort();
  }
}

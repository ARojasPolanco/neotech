import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/database/database.js";
import { AppError } from "../errors/indexError.js";
import DiscountCode from "../models/discountCodeModel.js";
import DiscountCampaign from "../models/discountCampaignModel.js";
import DiscountCampaignProduct from "../models/discountCampaignProductModel.js";
import Product from "../models/productModel.js";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

function randomCode(length = 6) {
  const bytes = crypto.randomBytes(length);
  let suffix = "";

  for (let i = 0; i < length; i++) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }

  return `NEO-${suffix}`;
}

export class DiscountService {
  async generateUniqueCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = randomCode();
      const exists = await DiscountCode.findOne({ where: { code } });
      if (!exists) return code;
    }

    throw new AppError("No se pudo generar un código único", 500);
  }

  async createCode({ discountPercent, maxUses, expiresInHours, code }) {
    const normalized = code
      ? normalizeCode(code)
      : await this.generateUniqueCode();

    if (code) {
      const exists = await DiscountCode.findOne({ where: { code: normalized } });
      if (exists) {
        throw new AppError("Ese código ya existe", 409);
      }
    }

    const expiresAt = new Date(
      Date.now() + Number(expiresInHours) * 60 * 60 * 1000,
    );

    return DiscountCode.create({
      code: normalized,
      discountPercent,
      maxUses,
      expiresAt,
    });
  }

  async listCodes() {
    return DiscountCode.findAll({ order: [["createdAt", "DESC"]] });
  }

  async setCodeActive(id, isActive) {
    const code = await DiscountCode.findByPk(id);
    if (!code) throw new AppError("Código de descuento no encontrado", 404);

    await code.update({ isActive });
    return code;
  }

  async findValidCode(rawCode) {
    const code = normalizeCode(rawCode);
    if (!code) throw new AppError("Ingresá un código de descuento", 422);

    const record = await DiscountCode.findOne({ where: { code } });
    if (!record) throw new AppError("Código de descuento inválido", 404);
    if (!record.isActive) {
      throw new AppError("El código de descuento está inactivo", 410);
    }
    if (new Date(record.expiresAt) <= new Date()) {
      throw new AppError("El código de descuento venció", 410);
    }
    if (Number(record.uses) >= Number(record.maxUses)) {
      throw new AppError(
        "El código de descuento ya no tiene usos disponibles",
        409,
      );
    }

    return record;
  }

  async validateCode(rawCode) {
    const record = await this.findValidCode(rawCode);

    return {
      code: record.code,
      discountPercent: Number(record.discountPercent),
      expiresAt: record.expiresAt,
      usesLeft: Number(record.maxUses) - Number(record.uses),
    };
  }

  async consumeCode(codeId) {
    const [rows] = await sequelize.query(
      `UPDATE "DiscountCodes"
       SET uses = uses + 1, "updatedAt" = NOW()
       WHERE id = :codeId
         AND "isActive" = true
         AND uses < "maxUses"
         AND "expiresAt" > NOW()
       RETURNING id`,
      { replacements: { codeId } },
    );

    return rows.length > 0;
  }

  async listCampaigns() {
    const campaigns = await DiscountCampaign.findAll({
      include: [{ model: DiscountCampaignProduct }],
      order: [["createdAt", "DESC"]],
    });

    return campaigns.map((campaign) => {
      const plain = campaign.toJSON();
      const products = plain.DiscountCampaignProducts || [];
      return {
        ...plain,
        productCount: products.length,
        productIds: products.map((item) => item.productId),
      };
    });
  }

  async createCampaign({ name, discountPercent, expiresAt, productIds }) {
    const uniqueIds = [...new Set(productIds)];
    const products = await Product.findAll({ where: { id: uniqueIds } });

    if (products.length !== uniqueIds.length) {
      throw new AppError("Alguno de los productos seleccionados no existe", 422);
    }

    const parsedExpiry = expiresAt ? new Date(expiresAt) : null;

    return sequelize.transaction(async (transaction) => {
      const campaign = await DiscountCampaign.create(
        { name, discountPercent, expiresAt: parsedExpiry },
        { transaction },
      );

      await DiscountCampaignProduct.bulkCreate(
        uniqueIds.map((productId) => ({ campaignId: campaign.id, productId })),
        { transaction },
      );

      await DiscountCampaignProduct.destroy({
        where: {
          productId: uniqueIds,
          campaignId: { [Op.ne]: campaign.id },
        },
        transaction,
      });

      await Product.update(
        {
          discountPercent,
          discountExpiresAt: parsedExpiry,
        },
        { where: { id: uniqueIds }, transaction },
      );

      return campaign;
    });
  }

  async endCampaign(id) {
    return sequelize.transaction(async (transaction) => {
      const campaign = await DiscountCampaign.findByPk(id, {
        include: [{ model: DiscountCampaignProduct }],
        transaction,
      });

      if (!campaign) throw new AppError("Campaña no encontrada", 404);
      if (!campaign.isActive) return campaign;

      const productIds = campaign.DiscountCampaignProducts.map(
        (item) => item.productId,
      );

      await campaign.update({ isActive: false }, { transaction });

      if (productIds.length > 0) {
        await Product.update(
          { discountPercent: null, discountExpiresAt: null },
          {
            where: {
              id: productIds,
              discountPercent: campaign.discountPercent,
              discountExpiresAt: campaign.expiresAt,
            },
            transaction,
          },
        );
      }

      await DiscountCampaignProduct.destroy({
        where: { campaignId: id },
        transaction,
      });

      return campaign;
    });
  }
}

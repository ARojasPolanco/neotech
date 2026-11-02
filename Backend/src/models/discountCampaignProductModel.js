import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const DiscountCampaignProduct = sequelize.define(
  "DiscountCampaignProduct",
  {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "DiscountCampaigns", key: "id" },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "Products", key: "id" },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["campaignId", "productId"],
      },
    ],
  },
);

export default DiscountCampaignProduct;

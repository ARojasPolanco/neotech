import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const DiscountCampaign = sequelize.define("DiscountCampaign", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  discountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default DiscountCampaign;

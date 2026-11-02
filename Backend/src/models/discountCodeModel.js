import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const DiscountCode = sequelize.define("DiscountCode", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  discountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  maxUses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  uses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default DiscountCode;

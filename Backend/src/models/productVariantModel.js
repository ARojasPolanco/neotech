import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const ProductVariant = sequelize.define("ProductVariant", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Products",
      key: "id",
    },
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  colorHex: {
    type: DataTypes.STRING(7),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

export default ProductVariant;

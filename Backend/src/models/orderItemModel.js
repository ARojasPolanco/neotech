import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const OrderItem = sequelize.define("OrderItem", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "Orders", key: "id" },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: "Products", key: "id" },
  },
  productVariantId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "ProductVariants", key: "id" },
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

export default OrderItem;

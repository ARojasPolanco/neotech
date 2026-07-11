import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const Order = sequelize.define("Order", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  orderNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: "Users", key: "id" },
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "cancelled"),
    defaultValue: "pending",
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

export default Order;

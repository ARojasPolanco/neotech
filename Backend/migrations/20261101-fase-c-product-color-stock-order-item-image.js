import { DataTypes } from "sequelize";

export const name = "20261101-fase-c-product-color-stock-order-item-image";

export async function up(queryInterface) {
  const productColumns = await queryInterface.describeTable("Products");

  if (!productColumns.color) {
    await queryInterface.addColumn("Products", "color", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }

  if (!productColumns.colorHex) {
    await queryInterface.addColumn("Products", "colorHex", {
      type: DataTypes.STRING(7),
      allowNull: true,
    });
  }

  if (!productColumns.stock) {
    await queryInterface.addColumn("Products", "stock", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  }

  const orderItemColumns = await queryInterface.describeTable("OrderItems");

  if (!orderItemColumns.imageUrl) {
    await queryInterface.addColumn("OrderItems", "imageUrl", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface) {
  const productColumns = await queryInterface.describeTable("Products");

  if (productColumns.stock) {
    await queryInterface.removeColumn("Products", "stock");
  }
  if (productColumns.colorHex) {
    await queryInterface.removeColumn("Products", "colorHex");
  }
  if (productColumns.color) {
    await queryInterface.removeColumn("Products", "color");
  }

  const orderItemColumns = await queryInterface.describeTable("OrderItems");

  if (orderItemColumns.imageUrl) {
    await queryInterface.removeColumn("OrderItems", "imageUrl");
  }
}

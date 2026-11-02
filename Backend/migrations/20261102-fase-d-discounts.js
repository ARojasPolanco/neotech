import { DataTypes } from "sequelize";

export const name = "20261102-fase-d-discounts";

async function hasTable(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) =>
    typeof table === "string" ? table === tableName : table.tableName === tableName,
  );
}

export async function up(queryInterface) {
  if (!(await hasTable(queryInterface, "DiscountCodes"))) {
    await queryInterface.createTable("DiscountCodes", {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      maxUses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  }

  if (!(await hasTable(queryInterface, "DiscountCampaigns"))) {
    await queryInterface.createTable("DiscountCampaigns", {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  }

  if (!(await hasTable(queryInterface, "DiscountCampaignProducts"))) {
    await queryInterface.createTable("DiscountCampaignProducts", {
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
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addIndex("DiscountCampaignProducts", ["campaignId", "productId"], {
      unique: true,
      name: "discount_campaign_products_unique",
    });
  }

  const orderColumns = await queryInterface.describeTable("Orders");

  if (!orderColumns.subtotal) {
    await queryInterface.addColumn("Orders", "subtotal", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    });
  }
  if (!orderColumns.discountCode) {
    await queryInterface.addColumn("Orders", "discountCode", {
      type: DataTypes.STRING(30),
      allowNull: true,
    });
  }
  if (!orderColumns.discountCodeId) {
    await queryInterface.addColumn("Orders", "discountCodeId", {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "DiscountCodes", key: "id" },
    });
  }
  if (!orderColumns.discountPercent) {
    await queryInterface.addColumn("Orders", "discountPercent", {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: null,
    });
  }
  if (!orderColumns.discountAmount) {
    await queryInterface.addColumn("Orders", "discountAmount", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  }
  if (!orderColumns.discountCodeConsumedAt) {
    await queryInterface.addColumn("Orders", "discountCodeConsumedAt", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }
}

export async function down(queryInterface) {
  const orderColumns = await queryInterface.describeTable("Orders");

  if (orderColumns.discountCodeConsumedAt) {
    await queryInterface.removeColumn("Orders", "discountCodeConsumedAt");
  }
  if (orderColumns.discountAmount) {
    await queryInterface.removeColumn("Orders", "discountAmount");
  }
  if (orderColumns.discountPercent) {
    await queryInterface.removeColumn("Orders", "discountPercent");
  }
  if (orderColumns.discountCodeId) {
    await queryInterface.removeColumn("Orders", "discountCodeId");
  }
  if (orderColumns.discountCode) {
    await queryInterface.removeColumn("Orders", "discountCode");
  }
  if (orderColumns.subtotal) {
    await queryInterface.removeColumn("Orders", "subtotal");
  }

  if (await hasTable(queryInterface, "DiscountCampaignProducts")) {
    await queryInterface.dropTable("DiscountCampaignProducts");
  }
  if (await hasTable(queryInterface, "DiscountCampaigns")) {
    await queryInterface.dropTable("DiscountCampaigns");
  }
  if (await hasTable(queryInterface, "DiscountCodes")) {
    await queryInterface.dropTable("DiscountCodes");
  }
}

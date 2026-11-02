import { DataTypes } from "sequelize";

export const name = "20261103-fase-e-settings";

async function hasTable(queryInterface, tableName) {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) =>
    typeof table === "string" ? table === tableName : table.tableName === tableName,
  );
}

export async function up(queryInterface) {
  if (await hasTable(queryInterface, "Settings")) return;

  await queryInterface.createTable("Settings", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    videoUrl: { type: DataTypes.STRING, allowNull: true },
    videoEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    logoUrl: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
}

export async function down(queryInterface) {
  if (await hasTable(queryInterface, "Settings")) {
    await queryInterface.dropTable("Settings");
  }
}

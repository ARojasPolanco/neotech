import logger from "../logger/logger.js";
import sequelize from "./database.js";
import * as faseC from "../../../migrations/20261101-fase-c-product-color-stock-order-item-image.js";
import * as faseD from "../../../migrations/20261102-fase-d-discounts.js";

const migrations = [
  {
    name: faseC.name,
    up: faseC.up,
    down: faseC.down,
  },
  {
    name: faseD.name,
    up: faseD.up,
    down: faseD.down,
  },
];

async function ensureMetaTable() {
  await sequelize.query(
    'CREATE TABLE IF NOT EXISTS "SequelizeMeta" ("name" VARCHAR(255) PRIMARY KEY)',
  );
}

export async function runMigrations() {
  await ensureMetaTable();

  for (const migration of migrations) {
    const [rows] = await sequelize.query(
      'SELECT 1 FROM "SequelizeMeta" WHERE name = :name',
      { replacements: { name: migration.name } },
    );

    if (rows.length > 0) continue;

    await migration.up(sequelize.getQueryInterface(), sequelize);
    await sequelize.query(
      'INSERT INTO "SequelizeMeta" (name) VALUES (:name)',
      { replacements: { name: migration.name } },
    );
    logger.info(`Migration applied: ${migration.name}`);
  }
}

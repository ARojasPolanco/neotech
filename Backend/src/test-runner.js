import "./config/enviroments/enviroments.js";
import sequelize from "./config/database/database.js";
import "./models/authModel.js";
import "./models/productModel.js";
import "./models/productVariantModel.js";
import "./models/orderModel.js";
import "./models/orderItemModel.js";
import "./models/settingModel.js";
import "./models/associations.js";
import { ensureSequence } from "./services/order.service.js";
import { runAuthTests } from "./test-auth.js";
import { runProductTests } from "./test-products.js";
import { runOrderTests } from "./test-orders.js";
import { runDiscountTests } from "./test-discounts.js";
import { runSettingsTests } from "./test-settings.js";

async function main() {
  console.log("\n=== Tests Neo Tech E-commerce ===\n");

  await sequelize.sync({ alter: true });
  await ensureSequence();

  await runAuthTests();
  await runProductTests();
  await runOrderTests();
  await runDiscountTests();
  await runSettingsTests();

  console.log("\n=== Todos los tests completados ===\n");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});

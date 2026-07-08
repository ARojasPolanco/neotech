import "./config/enviroments/enviroments.js";
import sequelize from "./config/database/database.js";
import "./models/authModel.js";
import "./models/productModel.js";
import "./models/productVariantModel.js";
import "./models/associations.js";
import { runAuthTests } from "./test-auth.js";
import { runProductTests } from "./test-products.js";

async function main() {
  console.log("\n=== Tests Neo Tech E-commerce ===\n");

  await sequelize.sync({ alter: true });

  await runAuthTests();
  await runProductTests();

  console.log("\n=== Todos los tests completados ===\n");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});

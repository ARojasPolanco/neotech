import "../src/config/enviroments/enviroments.js";
import sequelize from "../src/config/database/database.js";
import "../src/models/productModel.js";
import Product from "../src/models/productModel.js";

const categoryKeywords = [
  { pattern: /auricular|headphone|earphone|audifono/i, category: "Auriculares" },
  { pattern: /teclado|keyboard/i, category: "Teclados" },
  { pattern: /microfono|micrófono|mic|condenser/i, category: "Micrófonos" },
  { pattern: /parlante|speaker|boomcast|altavoz/i, category: "Parlantes" },
  { pattern: /cargador|cargador|gan|qi/i, category: "Cargadores" },
];

async function main() {
  await sequelize.authenticate();

  const orphans = await Product.findAll({
    where: { category: null },
    attributes: ["id", "name"],
  });

  if (orphans.length === 0) {
    console.log("Todos los productos ya tienen categoría.");
    process.exit(0);
  }

  console.log(`${orphans.length} productos sin categoría encontrados.\n`);

  for (const product of orphans) {
    const name = product.name.toLowerCase();
    let match = null;

    for (const kw of categoryKeywords) {
      if (kw.pattern.test(name)) {
        match = kw.category;
        break;
      }
    }

    const category = match || "Accesorios";

    await Product.update(
      { category },
      { where: { id: product.id } },
    );

    console.log(`  ${product.name} → ${category}`);
  }

  console.log("\nCategorías asignadas correctamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migración fallida:", err);
  process.exit(1);
});

import app from "./app.js";
import { envs } from "./config/enviroments/enviroments.js";
import { authenticate, syncUp } from "./config/database/database.js";
import Product from "./models/productModel.js";
import "./models/authModel.js";
import "./models/productModel.js";
import "./models/productVariantModel.js";
import "./models/orderModel.js";
import "./models/orderItemModel.js";
import "./models/associations.js";
import { ensureSequence } from "./services/order.service.js";
import transporter from "./config/mailer.js";

const categoryKeywords = [
  { pattern: /auricular|headphone|earphone|audifono/i, category: "Auriculares" },
  { pattern: /teclado|keyboard/i, category: "Teclados" },
  { pattern: /microfono|micrófono|mic|condenser/i, category: "Micrófonos" },
  { pattern: /parlante|speaker|boomcast|altavoz/i, category: "Parlantes" },
  { pattern: /cargador|cargador|gan|qi/i, category: "Cargadores" },
];

async function migrateCategories() {
  const orphans = await Product.findAll({
    where: { category: null },
    attributes: ["id", "name"],
  });

  if (orphans.length === 0) return;

  console.log(`[migrateCategories] ${orphans.length} products without category`);
  let updated = 0;

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
    updated++;
  }

  console.log(`[migrateCategories] ${updated} products categorized`);
}

async function main() {
  try {
    await authenticate();
    await syncUp();
    await ensureSequence();

    if (envs.NODE_ENV !== "test") {
      await migrateCategories();
    }

    transporter.verify((error, success) => {
      if (error) {
        console.error("[SMTP] Transporter verification failed:", error);
      } else {
        console.log("[SMTP] Transporter ready:", success);
      }
    });

    app.listen(envs.PORT, () => {
      console.log(`Server running on ${envs.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

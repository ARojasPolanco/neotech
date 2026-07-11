import { ok, rechazo, fallo, callHandler, resetCounters, printResumen } from "./test-utils.js";
import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  createVariant,
  deleteVariant,
} from "./controllers/productController.js";
import Product from "./models/productModel.js";
import "./models/productVariantModel.js";
import "./models/associations.js";
import sequelize from "./config/database/database.js";

const productData = {
  name: "Smartphone Test",
  description: "Un smartphone para testear",
  price: 599.99,
};

export async function runProductTests() {
  resetCounters();
  console.log("\n--- Product Tests ---\n");

  await sequelize.sync({ alter: true });
  let createdId;
  let variantId;

  // ── POSITIVOS ──

  const createRes = await callHandler(createProduct, productData);

  if (createRes.statusCode === 201 && createRes.body.id) {
    ok(`Product created: ${createRes.body.name}`);
    createdId = createRes.body.id;
  } else {
    fallo("Create product failed", createRes.body);
  }

  const listRes = await callHandler(findAllProducts, {});

  if (listRes.statusCode === 200 && Array.isArray(listRes.body)) {
    ok("List all products returns array");
  } else {
    fallo("List all products failed", listRes.body);
  }

  const getRes = await callHandler(findProductById, {}, {}, { id: createdId });

  if (getRes.statusCode === 200 && getRes.body.id === createdId) {
    ok("Get product by ID returns correct product");
  } else {
    fallo("Get product by ID failed", getRes.body);
  }

  const updateRes = await callHandler(
    updateProduct,
    { name: "Smartphone Updated", price: 499.99 },
    {},
    { id: createdId },
  );

  if (updateRes.statusCode === 200 && updateRes.body.name === "Smartphone Updated") {
    ok("Update product name and price");
  } else {
    fallo("Update product failed", updateRes.body);
  }

  // ── Variant tests ──

  const variantRes = await callHandler(
    createVariant,
    { color: "Negro", colorHex: "#000000", stock: 10 },
    {},
    { id: createdId },
  );

  if (variantRes.statusCode === 201 && variantRes.body.id) {
    ok(`Variant created: ${variantRes.body.color}`);
    variantId = variantRes.body.id;
  } else {
    fallo("Create variant failed", variantRes.body);
  }

  const getVariantsRes = await callHandler(
    getProductVariants,
    {},
    {},
    { id: createdId },
  );

  if (getVariantsRes.statusCode === 200 && Array.isArray(getVariantsRes.body)) {
    ok("Get product variants returns array");
  } else {
    fallo("Get variants failed", getVariantsRes.body);
  }

  const variantDeleted = await callHandler(
    deleteVariant,
    {},
    {},
    { id: variantId },
  );

  if (variantDeleted.statusCode === 200 && variantDeleted.body.status === "success") {
    ok("Delete variant returns success");
  } else {
    fallo("Delete variant failed", variantDeleted.body);
  }

  // ── Disable / soft delete product ──

  const disableRes = await callHandler(deleteProduct, {}, {}, { id: createdId });

  if (disableRes.statusCode === 200 && disableRes.body.status === "success") {
    ok("Disable (delete) product returns success");
  } else {
    fallo("Disable product failed", disableRes.body);
  }

  const afterDisable = await Product.findOne({
    where: { id: createdId, isActive: true },
  });
  if (!afterDisable) {
    ok("Disabled product is not returned in active queries");
  } else {
    fallo("Disabled product still appears as active");
  }

  // ── NEGATIVOS ──

  const getNotFound = await callHandler(
    findProductById,
    {},
    {},
    { id: "00000000-0000-0000-0000-000000000000" },
  );

  if (getNotFound.statusCode === 404) {
    rechazo("Get non-existent product returns 404");
  } else {
    fallo("Get non-existent product should return 404", getNotFound.body);
  }

  const createInvalid = await callHandler(createProduct, {
    name: "Negative Price",
    price: -10,
  });

  if (createInvalid.statusCode === 422) {
    rechazo("Create product with negative price rejected correctly");
  } else {
    fallo("Create product with negative price should return 422", createInvalid.body);
  }

  const createNoName = await callHandler(createProduct, {
    price: 100,
  });

  if (createNoName.statusCode === 422) {
    rechazo("Create product without name rejected correctly");
  } else {
    fallo("Create product without name should return 422", createNoName.body);
  }

  const listFiltered = await callHandler(
    findAllProducts,
    {},
    { isActive: "true" },
  );

  if (listFiltered.statusCode === 200 && Array.isArray(listFiltered.body)) {
    ok("Filter products by isActive works");
  } else {
    fallo("Filter products by isActive failed", listFiltered.body);
  }

  // ── Variant negative tests ──

  const variantInvalid = await callHandler(
    createVariant,
    { color: "Rojo", colorHex: "rojo", stock: 5 },
    {},
    { id: createdId },
  );

  if (variantInvalid.statusCode === 422) {
    rechazo("Create variant with invalid hex rejected correctly");
  } else {
    fallo("Create variant with invalid hex should return 422", variantInvalid.body);
  }

  // Cleanup
  await Product.destroy({ where: { id: createdId }, force: true });

  printResumen();
}

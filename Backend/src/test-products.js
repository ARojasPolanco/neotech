import { ok, rechazo, fallo, callHandler, resetCounters, printResumen } from "./test-utils.js";
import {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./controllers/productController.js";
import Product from "./models/productModel.js";
import sequelize from "./config/database/database.js";

const productData = {
  name: "Smartphone Test",
  description: "Un smartphone para testear",
  price: 599.99,
  stock: 10,
};

export async function runProductTests() {
  resetCounters();
  console.log("\n--- Product Tests ---\n");

  await sequelize.sync({ alter: true });
  let createdId;

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

  const disableRes = await callHandler(deleteProduct, {}, {}, { id: createdId });

  if (disableRes.statusCode === 200 && disableRes.body.status === "success") {
    ok("Disable (delete) product returns success");
  } else {
    fallo("Disable product failed", disableRes.body);
  }

  // Verify it's disabled (not found in active list)
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
    name: "No Price",
    price: -10,
    stock: 5,
  });

  if (createInvalid.statusCode === 422) {
    rechazo("Create product with negative price rejected correctly");
  } else {
    fallo("Create product with negative price should return 422", createInvalid.body);
  }

  const createNoName = await callHandler(createProduct, {
    price: 100,
    stock: 5,
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

  // Cleanup
  await Product.destroy({ where: { id: createdId }, force: true });

  printResumen();
}

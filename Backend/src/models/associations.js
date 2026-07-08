import Product from "./productModel.js";
import ProductVariant from "./productVariantModel.js";

Product.hasMany(ProductVariant, { foreignKey: "productId" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

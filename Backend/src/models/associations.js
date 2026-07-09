import Product from "./productModel.js";
import ProductVariant from "./productVariantModel.js";
import Order from "./orderModel.js";
import OrderItem from "./orderItemModel.js";
import User from "./authModel.js";

Product.hasMany(ProductVariant, { foreignKey: "productId" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

import Product from "./productModel.js";
import ProductVariant from "./productVariantModel.js";
import Order from "./orderModel.js";
import OrderItem from "./orderItemModel.js";
import User from "./authModel.js";
import DiscountCode from "./discountCodeModel.js";
import DiscountCampaign from "./discountCampaignModel.js";
import DiscountCampaignProduct from "./discountCampaignProductModel.js";

Product.hasMany(ProductVariant, { foreignKey: "productId" });
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

Order.belongsTo(DiscountCode, { foreignKey: "discountCodeId" });
DiscountCode.hasMany(Order, { foreignKey: "discountCodeId" });

DiscountCampaign.hasMany(DiscountCampaignProduct, { foreignKey: "campaignId" });
DiscountCampaignProduct.belongsTo(DiscountCampaign, { foreignKey: "campaignId" });

Product.hasMany(DiscountCampaignProduct, { foreignKey: "productId" });
DiscountCampaignProduct.belongsTo(Product, { foreignKey: "productId" });

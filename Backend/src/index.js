import app from "./app.js";
import { envs } from "./config/enviroments/enviroments.js";
import { authenticate, syncUp } from "./config/database/database.js";
import "./models/authModel.js";
import "./models/productModel.js";
import "./models/productVariantModel.js";
import "./models/orderModel.js";
import "./models/orderItemModel.js";
import "./models/associations.js";
import { ensureSequence } from "./services/order.service.js";

async function main() {
  try {
    await authenticate();
    await syncUp();
    await ensureSequence();

    app.listen(envs.PORT, () => {
      console.log(`Server running on ${envs.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

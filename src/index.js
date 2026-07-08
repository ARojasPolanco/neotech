import app from "./app.js";
import { envs } from "./config/enviroments/enviroments.js";
import { authenticate, syncUp } from "./config/database/database.js";

async function main() {
  try {
    await authenticate();
    await syncUp();

    app.listen(envs.PORT, () => {
      console.log(`Server running on ${envs.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

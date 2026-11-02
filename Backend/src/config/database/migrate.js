import sequelize, { authenticate, syncUp } from "./database.js";
import { runMigrations } from "./migrator.js";

async function main() {
  try {
    await authenticate();
    await syncUp();
    await runMigrations();
    console.log("Migrations completed");
  } catch (error) {
    console.error("Migration error:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();

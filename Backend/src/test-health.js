import {
  ok,
  rechazo,
  fallo,
  resetCounters,
  callHandler,
  printResumen,
} from "./test-utils.js";
import sequelize from "./config/database/database.js";
import { healthCheck } from "./controllers/healthController.js";

export async function runHealthTests() {
  resetCounters();
  console.log("\n--- Health Tests ---\n");

  const healthy = await callHandler(healthCheck, {});

  if (healthy.statusCode === 200 && healthy.body.status === "ok") {
    ok("Health check reports the database as available");
  } else {
    fallo("Health check failed", healthy.body);
  }

  const originalQuery = sequelize.query;
  sequelize.query = async () => {
    throw new Error("database down");
  };

  const unhealthy = await callHandler(healthCheck, {});
  sequelize.query = originalQuery;

  if (unhealthy.statusCode === 503 && unhealthy.body.status === "error") {
    rechazo("Health check reports 503 when the database is down");
  } else {
    fallo("Health check should report 503", unhealthy.body);
  }

  printResumen();
}

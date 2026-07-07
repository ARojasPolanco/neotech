import { Sequelize } from "sequelize";
import { envs } from "../enviroments/enviroments.js";
import logger from "../logger/logger.js";

const sequelize = new Sequelize(envs.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: envs.SSL_ACTIVE === "true" ? { rejectUnauthorized: false } : false,
  },
});

export async function authenticate() {
  try {
    await sequelize.authenticate();
    logger.info("The authentication has been established successfully");
    envs.SSL_ACTIVE === "true" && logger.info("SSL is active");
  } catch (error) {
    throw new Error(`Error de autenticación: ${error.message}`);
  }
}

export async function syncUp(options = {}) {
  try {
    await sequelize.sync(options);
    logger.info("Connection has been synced successfully");
  } catch (error) {
    throw new Error(`Error al sincronizar: ${error.message}`);
  }
}

export default sequelize;

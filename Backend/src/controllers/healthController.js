import sequelize from "../config/database/database.js";

export const healthCheck = async (req, res) => {
  try {
    await sequelize.query("SELECT 1");
    return res.status(200).json({ status: "ok" });
  } catch {
    return res.status(503).json({
      status: "error",
      message: "Base de datos no disponible",
    });
  }
};

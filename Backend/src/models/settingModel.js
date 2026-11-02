import { DataTypes } from "sequelize";
import sequelize from "../config/database/database.js";

const Setting = sequelize.define("Setting", {
  id: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videoEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Setting;

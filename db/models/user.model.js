const { DataTypes } = require("sequelize");
const sequelize = require("../../config/connection");
const { USER_STATUS } = require("../../constants/index");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      defaultValue: USER_STATUS.ACTIVE,
      allowNull: false,
    },
    userDirectory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "users",

    indexes: [{ fields: ["username"] }, { fields: ["mobile"] }],
  }
);

module.exports = User;

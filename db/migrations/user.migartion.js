"use strict";

const { USER_STATUS } = require("../../constants/index");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },

      mobile: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      status: {
        type: Sequelize.ENUM(...Object.values(USER_STATUS)),
        allowNull: false,
        defaultValue: USER_STATUS.ACTIVE,
      },

      userDirectory: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("users", ["username"]);
    await queryInterface.addIndex("users", ["mobile"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};

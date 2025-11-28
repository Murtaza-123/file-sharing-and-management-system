"use strict";
const { USER_STATUS } = require("../../constants/index");
const { v4: uuid } = require("uuid");

module.exports = {
  async up(queryInterface) {
    const users = [
      {
        id: uuid(),
        username: "murtaza_hassan",
        mobile: "03000000000",
        active: true,
        status: USER_STATUS.ACTIVE,
        userDirectory: "users/murtaza/",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        username: "razee_khan",
        mobile: "03011111111",
        active: true,
        status: USER_STATUS.ACTIVE,
        userDirectory: "users/razee/",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuid(),
        username: "zainab_iqbal",
        mobile: "03022222222",
        active: true,
        status: USER_STATUS.BLOCKED,
        userDirectory: "users/zainab/",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", users);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  },
};

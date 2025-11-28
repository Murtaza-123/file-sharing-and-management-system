const dotenv = require("dotenv");
dotenv.config();

const sequelize = {
  development: {
    dialect: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    logging: false,
  },
  production: {
    dialect: "mysql",
  },
};

module.exports = sequelize;

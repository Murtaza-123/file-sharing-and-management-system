const { Sequelize } = require("sequelize");
const data = require("./database");

const env = process.env.NODE_ENV || "development";
const config = data[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port || 3306,
    dialect: "mysql",
    logging: console.log,

    dialectOptions: {
      socketPath: null,
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Connected to the database."))
  .catch((err) => console.error("Unable to connect:", err));

module.exports = sequelize;

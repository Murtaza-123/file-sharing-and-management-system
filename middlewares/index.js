const { requireRead } = require("./require-read.middleware");
const { requireWrite } = require("./primary-key.middleware");
const { authenticateKey } = require("./authenticate.middleware");

module.exports = {
  requireRead,
  requireWrite,
  authenticateKey,
};

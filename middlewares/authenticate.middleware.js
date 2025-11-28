const jwt = require("jsonwebtoken");
const { USER_STATUS } = require("../constants");
const User = require("../db/models/user.model");

const authenticateKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(403).json({
        status: false,
        message: "API key missing in 'x-api-key' header",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(apiKey, process.env.KEY_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: "Invalid or expired API key",
      });
    }

    const { userId, keyType, permissions, expiresAt } = decoded;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.status === USER_STATUS.BLOCKED) {
      return res.status(403).json({
        status: false,
        message: "User is blocked",
      });
    }

    req.userId = userId;
    req.apiKeyType = keyType;
    req.permissions = permissions;
    req.keyExpiresAt = expiresAt;

    next();
  } catch (error) {
    console.error("KeyAuth Middleware Error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { authenticateKey };

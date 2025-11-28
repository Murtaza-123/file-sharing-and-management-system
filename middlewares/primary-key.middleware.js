const requireWrite = (req, res, next) => {
  if (req.apiKeyType !== "primary") {
    return res.status(403).json({
      status: false,
      message: "Only primary keys are allowed to perform write operations",
    });
  }

  if (!req.permissions?.includes("write")) {
    return res.status(403).json({
      status: false,
      message: "This API key does not have write permission",
    });
  }

  next();
};

module.exports = { requireWrite };

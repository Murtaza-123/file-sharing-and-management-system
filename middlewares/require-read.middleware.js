const requireRead = (req, res, next) => {
  if (!req.permissions || !req.permissions.includes("read")) {
    return res.status(403).json({
      status: false,
      message: "Read operations require read permission",
    });
  }
  next();
};

module.exports = { requireRead };

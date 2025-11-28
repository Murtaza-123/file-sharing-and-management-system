const { Router } = require("express");

const userRoute = require("./user.route");
const router = Router();

router.use("/api/v1/user", userRoute);

module.exports = router;

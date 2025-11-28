const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes/index");
const { keysUtility, responseUtility } = require("./utils/index");
dotenv.config();

require("./config/connection");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/generate-primary-key", async (req, res) => {
  const primaryKey = await keysUtility.generatePrimaryKey(req, res);
  return responseUtility.sendResponse(res, primaryKey);
});

app.listen(PORT, () => {
  console.log(`Express Server Started on port ${PORT}`);
});

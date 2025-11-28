const jwt = require("jsonwebtoken");

async function generatePrimaryKey(req) {
  try {
    const data = req.body;

    if (data.expiresAt) {
      const now = new Date();
      now.setDate(now.getDate() + Number(data.expiresAt));
      data.expiresAt = now.toISOString();
    }
    const token = jwt.sign(data, process.env.KEY_SECRET);

    return {
      status: true,
      message: "Primary key generated successfully",
      data: token,
      statusCode: 200,
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
      data: null,
      statusCode: 500,
    };
  }
}

module.exports = { generatePrimaryKey };

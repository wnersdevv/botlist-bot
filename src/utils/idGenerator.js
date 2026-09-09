const crypto = require("crypto");

function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("hex");
}

module.exports = { generateToken };

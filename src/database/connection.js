const mongoose = require("mongoose");
const { getConfig } = require("../utils/config");
const logger = require("../utils/logger");

async function connectDatabase() {
  const { database } = getConfig();

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB baglantisi kuruldu.");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB baglanti hatasi:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB baglantisi kesildi.");
  });

  await mongoose.connect(database.url, {
    autoIndex: true,
  });

  return mongoose.connection;
}

module.exports = { connectDatabase };

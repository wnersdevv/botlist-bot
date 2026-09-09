const Log = require("../models/Log");
const logger = require("../utils/logger");

async function recordLog(action, { actor = null, target = null, targetType = null, metadata = {}, ip = null } = {}) {
  try {
    await Log.create({ action, actor, target, targetType, metadata, ip });
  } catch (err) {
    logger.error("Log kaydi olusturulamadi:", err.message);
  }
}

module.exports = { recordLog };

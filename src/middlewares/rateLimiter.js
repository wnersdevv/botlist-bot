const rateLimit = require("express-rate-limit");
const { getConfig } = require("../utils/config");

function buildLimiter(perMinute, message) {
  return rateLimit({
    windowMs: 60 * 1000,
    max: perMinute,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(429).json({ success: false, error: { message } });
      }
      return res.status(429).render("errors/429", { title: "Cok Fazla Istek" });
    },
  });
}

function apiLimiter() {
  const { limits } = getConfig();
  return buildLimiter(limits.apiRateLimitPerMinute, "API istek limitine ulastin.");
}

function webLimiter() {
  const { limits } = getConfig();
  return buildLimiter(limits.webRateLimitPerMinute, "Cok fazla istek gonderdin, biraz bekle.");
}

module.exports = { apiLimiter, webLimiter };

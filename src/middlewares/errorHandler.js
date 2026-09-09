const logger = require("../utils/logger");

function notFoundHandler(req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ success: false, error: { message: "Bulunamadi." } });
  }
  res.status(404).render("errors/404", { title: "Sayfa Bulunamadi" });
}

function globalErrorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);

  const status = err.status || 500;

  if (req.originalUrl.startsWith("/api")) {
    return res.status(status).json({
      success: false,
      error: { message: status === 500 ? "Sunucu hatasi olustu." : err.message },
    });
  }

  if (status === 403) return res.status(403).render("errors/403", { title: "Erisim Reddedildi" });
  if (status === 429) return res.status(429).render("errors/429", { title: "Cok Fazla Istek" });

  res.status(500).render("errors/500", { title: "Sunucu Hatasi" });
}

module.exports = { notFoundHandler, globalErrorHandler };

const { getConfig } = require("../utils/config");

function maintenanceGuard(req, res, next) {
  const { site } = getConfig();
  if (!site.maintenanceMode) return next();

  const isAdminRoute = req.originalUrl.startsWith("/admin") || req.originalUrl.startsWith("/auth");
  if (isAdminRoute) return next();

  res.status(503).render("errors/maintenance", { title: "Bakim Modu" });
}

module.exports = { maintenanceGuard };

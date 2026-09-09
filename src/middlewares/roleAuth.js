const ROLE_ORDER = ["user", "moderator", "admin", "owner"];

function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(401).json({ success: false, error: { message: "Giris yapmalisin." } });
      }
      return res.redirect("/auth/discord");
    }

    const userLevel = ROLE_ORDER.indexOf(req.user.role);
    const requiredLevel = ROLE_ORDER.indexOf(minRole);

    if (userLevel < requiredLevel) {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(403).json({ success: false, error: { message: "Yetkin yok." } });
      }
      return res.status(403).render("errors/403", { title: "Erisim Reddedildi" });
    }

    next();
  };
}

module.exports = { requireRole };

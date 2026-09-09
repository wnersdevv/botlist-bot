function requireAuth(req, res, next) {
  if (!req.session.userId) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ success: false, error: { message: "Giris yapmalisin." } });
    }
    return res.redirect("/auth/discord");
  }
  next();
}

function attachUser() {
  const User = require("../models/User");
  return async (req, res, next) => {
    if (req.session.userId) {
      req.user = await User.findById(req.session.userId);
      if (req.user && req.user.banned) {
        req.session.destroy(() => {});
        req.user = null;
      }
    }
    res.locals.currentUser = req.user || null;
    next();
  };
}

module.exports = { requireAuth, attachUser };

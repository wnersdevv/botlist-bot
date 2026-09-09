const Bot = require("../models/Bot");
const User = require("../models/User");
const Report = require("../models/Report");
const Review = require("../models/Review");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Log = require("../models/Log");
const { getAdminDashboardStats } = require("../services/statsService");
const { parsePagination, buildMeta } = require("../utils/pagination");
const { recordLog } = require("../services/logService");
const { invalidatePrefix } = require("../services/cacheService");

async function showAdminDashboard(req, res, next) {
  try {
    const stats = await getAdminDashboardStats();
    const recentLogs = await Log.find().sort({ createdAt: -1 }).limit(15).populate("actor", "username");
    res.render("admin/dashboard", { title: "Admin Paneli", stats, recentLogs });
  } catch (err) {
    next(err);
  }
}

async function listPendingBots(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const filter = { status: req.query.status || "pending" };

    const [bots, total] = await Promise.all([
      Bot.find(filter).sort({ createdAt: 1 }).skip(skip).limit(size).populate("ownerId", "username discordId").populate("category", "name"),
      Bot.countDocuments(filter),
    ]);

    res.render("admin/bots", { title: "Bot Yonetimi", bots, meta: buildMeta(total, page, size), status: filter.status });
  } catch (err) {
    next(err);
  }
}

async function approveBot(req, res, next) {
  try {
    const bot = await Bot.findByIdAndUpdate(
      req.params.id,
      { status: "approved", statusReason: null },
      { new: true }
    );
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    await recordLog("bot.approved", { actor: req.user._id, target: bot.botId, targetType: "Bot" });
    invalidatePrefix("bots:");

    const { notifyBotApproved } = require("../discord/notifier");
    notifyBotApproved(bot).catch(() => {});

    res.redirect("/admin/bots");
  } catch (err) {
    next(err);
  }
}

async function rejectBot(req, res, next) {
  try {
    const bot = await Bot.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", statusReason: req.body.reason || "Belirtilmedi" },
      { new: true }
    );
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    await recordLog("bot.rejected", { actor: req.user._id, target: bot.botId, targetType: "Bot", metadata: { reason: req.body.reason } });

    const { notifyBotRejected } = require("../discord/notifier");
    notifyBotRejected(bot).catch(() => {});

    res.redirect("/admin/bots");
  } catch (err) {
    next(err);
  }
}

async function suspendBot(req, res, next) {
  try {
    const bot = await Bot.findByIdAndUpdate(
      req.params.id,
      { status: "suspended", statusReason: req.body.reason || "Belirtilmedi" },
      { new: true }
    );
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    await recordLog("bot.suspended", { actor: req.user._id, target: bot.botId, targetType: "Bot" });
    invalidatePrefix("bots:");
    res.redirect("/admin/bots");
  } catch (err) {
    next(err);
  }
}

async function deleteBotAdmin(req, res, next) {
  try {
    const bot = await Bot.findByIdAndDelete(req.params.id);
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    await recordLog("bot.deleted", { actor: req.user._id, target: bot.botId, targetType: "Bot" });
    invalidatePrefix("bots:");
    res.redirect("/admin/bots");
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.q) filter.username = { $regex: req.query.q, $options: "i" };

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size),
      User.countDocuments(filter),
    ]);

    res.render("admin/users", { title: "Kullanici Yonetimi", users, meta: buildMeta(total, page, size), query: req.query });
  } catch (err) {
    next(err);
  }
}

async function banUser(req, res, next) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).render("errors/404", { title: "Kullanici Bulunamadi" });
    if (target.hasRoleAtLeast("admin")) {
      return res.status(403).render("errors/403", { title: "Erisim Reddedildi" });
    }

    target.banned = true;
    target.banReason = req.body.reason || "Belirtilmedi";
    await target.save();

    await recordLog("user.banned", { actor: req.user._id, target: target.discordId, targetType: "User" });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

async function unbanUser(req, res, next) {
  try {
    const target = await User.findByIdAndUpdate(req.params.id, { banned: false, banReason: null });
    if (!target) return res.status(404).render("errors/404", { title: "Kullanici Bulunamadi" });

    await recordLog("user.unbanned", { actor: req.user._id, target: target.discordId, targetType: "User" });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

async function setUserRole(req, res, next) {
  try {
    if (!req.user.hasRoleAtLeast("owner")) {
      return res.status(403).render("errors/403", { title: "Erisim Reddedildi" });
    }

    const target = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    await recordLog("user.role_changed", { actor: req.user._id, target: target.discordId, targetType: "User", metadata: { role: req.body.role } });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const filter = { status: req.query.status || "open" };

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(size).populate("bot", "name botId").populate("reporter", "username"),
      Report.countDocuments(filter),
    ]);

    res.render("admin/reports", { title: "Raporlar", reports, meta: buildMeta(total, page, size), status: filter.status });
  } catch (err) {
    next(err);
  }
}

async function resolveReport(req, res, next) {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, handledBy: req.user._id, resolutionNote: req.body.note || null },
      { new: true }
    );
    if (!report) return res.status(404).render("errors/404", { title: "Rapor Bulunamadi" });

    await recordLog("report.resolved", { actor: req.user._id, target: String(report._id), targetType: "Report", metadata: { status: report.status } });
    res.redirect("/admin/reports");
  } catch (err) {
    next(err);
  }
}

async function deleteReviewAdmin(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).render("errors/404", { title: "Yorum Bulunamadi" });

    await recordLog("review.deleted", { actor: req.user._id, target: String(review._id), targetType: "Review" });
    res.redirect("back");
  } catch (err) {
    next(err);
  }
}

async function manageCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render("admin/categories", { title: "Kategoriler", categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const slug = req.body.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await Category.create({ name: req.body.name, slug, description: req.body.description || "" });
    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect("/admin/categories");
  } catch (err) {
    next(err);
  }
}

async function manageTags(req, res, next) {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.render("admin/tags", { title: "Etiketler", tags });
  } catch (err) {
    next(err);
  }
}

async function createTag(req, res, next) {
  try {
    const slug = req.body.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await Tag.create({ name: req.body.name.toLowerCase().trim(), slug });
    res.redirect("/admin/tags");
  } catch (err) {
    next(err);
  }
}

async function deleteTag(req, res, next) {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.redirect("/admin/tags");
  } catch (err) {
    next(err);
  }
}

async function showSiteSettings(req, res, next) {
  const { getConfig } = require("../utils/config");
  res.render("admin/settings", { title: "Site Ayarlari", config: getConfig() });
}

async function updateSiteSettings(req, res, next) {
  try {
    const fs = require("fs");
    const path = require("path");
    const { getConfig, reloadConfig } = require("../utils/config");
    const configPath = path.join(__dirname, "..", "..", "ayarlar.json");

    const current = getConfig();
    current.site.name = req.body.siteName || current.site.name;
    current.site.description = req.body.siteDescription || current.site.description;
    current.site.maintenanceMode = req.body.maintenanceMode === "on";
    current.vote.cooldown = parseInt(req.body.voteCooldown, 10) || current.vote.cooldown;

    fs.writeFileSync(configPath, JSON.stringify(current, null, 2));
    reloadConfig();

    await recordLog("settings.updated", { actor: req.user._id });
    res.redirect("/admin/settings");
  } catch (err) {
    next(err);
  }
}

async function viewLogs(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const [logs, total] = await Promise.all([
      Log.find().sort({ createdAt: -1 }).skip(skip).limit(size).populate("actor", "username"),
      Log.countDocuments(),
    ]);
    res.render("admin/logs", { title: "Sistem Loglari", logs, meta: buildMeta(total, page, size) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  showAdminDashboard,
  listPendingBots,
  approveBot,
  rejectBot,
  suspendBot,
  deleteBotAdmin,
  listUsers,
  banUser,
  unbanUser,
  setUserRole,
  listReports,
  resolveReport,
  deleteReviewAdmin,
  manageCategories,
  createCategory,
  deleteCategory,
  manageTags,
  createTag,
  deleteTag,
  showSiteSettings,
  updateSiteSettings,
  viewLogs,
};

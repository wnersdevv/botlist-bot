const User = require("../models/User");
const Bot = require("../models/Bot");
const Vote = require("../models/Vote");
const Review = require("../models/Review");
const Report = require("../models/Report");
const { remember } = require("./cacheService");

async function getAdminDashboardStats() {
  return remember("admin:dashboard-stats", 30, async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalBots,
      verifiedBots,
      pendingBots,
      suspendedBots,
      totalVotes,
      votesToday,
      totalReviews,
      openReports,
    ] = await Promise.all([
      User.countDocuments(),
      Bot.countDocuments(),
      Bot.countDocuments({ status: "approved", verified: true }),
      Bot.countDocuments({ status: "pending" }),
      Bot.countDocuments({ status: "suspended" }),
      Vote.countDocuments(),
      Vote.countDocuments({ createdAt: { $gte: startOfDay } }),
      Review.countDocuments(),
      Report.countDocuments({ status: "open" }),
    ]);

    return {
      totalUsers,
      totalBots,
      verifiedBots,
      pendingBots,
      suspendedBots,
      totalVotes,
      votesToday,
      totalReviews,
      openReports,
    };
  });
}

async function getPublicSiteStats() {
  return remember("public:site-stats", 60, async () => {
    const [totalBots, approvedBots, totalUsers, totalVotes] = await Promise.all([
      Bot.countDocuments(),
      Bot.countDocuments({ status: "approved" }),
      User.countDocuments(),
      Vote.countDocuments(),
    ]);
    return { totalBots, approvedBots, totalUsers, totalVotes };
  });
}

module.exports = { getAdminDashboardStats, getPublicSiteStats };

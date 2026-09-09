const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const Bot = require("../models/Bot");
const { getPublicSiteStats } = require("../services/statsService");

router.get("/", async (req, res, next) => {
  try {
    const [popular, trending, newest, categories, stats] = await Promise.all([
      Bot.find({ status: "approved" }).sort({ voteCount: -1 }).limit(8).populate("category", "name slug"),
      Bot.find({ status: "approved" }).sort({ weeklyVoteCount: -1 }).limit(8).populate("category", "name slug"),
      Bot.find({ status: "approved" }).sort({ createdAt: -1 }).limit(8).populate("category", "name slug"),
      Category.find().sort({ botCount: -1 }).limit(12),
      getPublicSiteStats(),
    ]);

    res.render("home", { title: "Ana Sayfa", popular, trending, newest, categories, stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

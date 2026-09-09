const Bot = require("../models/Bot");
const Vote = require("../models/Vote");
const Review = require("../models/Review");

async function showDashboard(req, res, next) {
  try {
    const bots = await Bot.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).populate("category", "name slug");
    res.render("dashboard/index", { title: "Panelim", bots });
  } catch (err) {
    next(err);
  }
}

async function showBotManage(req, res, next) {
  try {
    const bot = await Bot.findOne({ _id: req.params.id, ownerId: req.user._id }).populate("category").populate("tags");
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    const [voteHistory, reviews] = await Promise.all([
      Vote.find({ bot: bot._id }).sort({ createdAt: -1 }).limit(50),
      Review.find({ bot: bot._id }).sort({ createdAt: -1 }).populate("user", "username avatar"),
    ]);

    res.render("dashboard/bot-manage", { title: bot.name, bot, voteHistory, reviews });
  } catch (err) {
    next(err);
  }
}

async function updateBot(req, res, next) {
  try {
    const bot = await Bot.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    const editableFields = [
      "shortDescription",
      "longDescription",
      "category",
      "prefix",
      "website",
      "supportServer",
      "github",
      "inviteUrl",
    ];

    for (const field of editableFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        bot[field] = req.body[field];
      }
    }

    if (req.body.tags) {
      bot.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    }

    await bot.save();
    res.redirect(`/dashboard/bots/${bot._id}`);
  } catch (err) {
    next(err);
  }
}

async function deleteBot(req, res, next) {
  try {
    const bot = await Bot.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
}

module.exports = { showDashboard, showBotManage, updateBot, deleteBot };

const Favorite = require("../models/Favorite");
const Bot = require("../models/Bot");
const { success, failure } = require("../utils/apiResponse");

async function toggleFavorite(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId, status: "approved" });
    if (!bot) return failure(res, "Bot bulunamadi.", 404);

    const existing = await Favorite.findOne({ user: req.user._id, bot: bot._id });

    if (existing) {
      await existing.deleteOne();
      return success(res, { favorited: false });
    }

    await Favorite.create({ user: req.user._id, bot: bot._id });
    return success(res, { favorited: true });
  } catch (err) {
    next(err);
  }
}

async function listFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "bot", populate: { path: "category", select: "name slug" } });

    res.render("dashboard/favorites", { title: "Favorilerim", favorites: favorites.filter((f) => f.bot) });
  } catch (err) {
    next(err);
  }
}

module.exports = { toggleFavorite, listFavorites };

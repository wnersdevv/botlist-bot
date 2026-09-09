const Bot = require("../models/Bot");
const Review = require("../models/Review");
const { success, failure } = require("../utils/apiResponse");
const { recordLog } = require("../services/logService");

async function recalcRating(botId) {
  const stats = await Review.aggregate([
    { $match: { bot: botId } },
    { $group: { _id: "$bot", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Bot.updateOne({ _id: botId }, { ratingAverage: Math.round(avg * 10) / 10, ratingCount: count });
}

async function createReview(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId, status: "approved" });
    if (!bot) return failure(res, "Bot bulunamadi.", 404);

    const existing = await Review.findOne({ bot: bot._id, user: req.user._id });
    if (existing) return failure(res, "Bu bota zaten yorum yaptin.", 409);

    const review = await Review.create({
      bot: bot._id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    await recalcRating(bot._id);
    await recordLog("review.created", { actor: req.user._id, target: bot.botId, targetType: "Bot" });

    return success(res, review, null, 201);
  } catch (err) {
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return failure(res, "Yorum bulunamadi.", 404);

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    review.edited = true;
    await review.save();

    await recalcRating(review.bot);
    return success(res, review);
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    const isModerator = req.user.hasRoleAtLeast("moderator");
    const filter = isModerator ? { _id: req.params.reviewId } : { _id: req.params.reviewId, user: req.user._id };

    const review = await Review.findOneAndDelete(filter);
    if (!review) return failure(res, "Yorum bulunamadi.", 404);

    await recalcRating(review.bot);
    await recordLog("review.deleted", { actor: req.user._id, target: String(review._id), targetType: "Review" });

    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, updateReview, deleteReview };

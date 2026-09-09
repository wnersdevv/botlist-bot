const Bot = require("../models/Bot");
const { castVote, getRemainingCooldown } = require("../services/voteService");
const { recordLog } = require("../services/logService");
const { success, failure } = require("../utils/apiResponse");

async function voteForBot(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId, status: "approved" });
    if (!bot) return failure(res, "Bot bulunamadi.", 404);

    const updated = await castVote(bot, req.user, req.ip);
    await recordLog("vote.cast", { actor: req.user._id, target: bot.botId, targetType: "Bot" });

    return success(res, { voteCount: updated.voteCount });
  } catch (err) {
    if (err.code === "SELF_VOTE") return failure(res, err.message, 400, err.code);
    if (err.code === "COOLDOWN") {
      return failure(res, err.message, 429, err.code);
    }
    next(err);
  }
}

async function voteStatus(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId });
    if (!bot) return failure(res, "Bot bulunamadi.", 404);

    const remaining = req.user ? await getRemainingCooldown(bot._id, req.user._id) : 0;
    return success(res, { canVote: remaining === 0, remainingSeconds: remaining });
  } catch (err) {
    next(err);
  }
}

module.exports = { voteForBot, voteStatus };

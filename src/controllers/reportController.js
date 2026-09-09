const Bot = require("../models/Bot");
const Report = require("../models/Report");
const { success, failure } = require("../utils/apiResponse");
const { recordLog } = require("../services/logService");

async function createReport(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId });
    if (!bot) return failure(res, "Bot bulunamadi.", 404);

    const report = await Report.create({
      bot: bot._id,
      reporter: req.user._id,
      reason: req.body.reason,
      details: req.body.details || "",
    });

    await recordLog("report.created", { actor: req.user._id, target: bot.botId, targetType: "Bot" });
    return success(res, report, null, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport };

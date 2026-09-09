const crypto = require("crypto");
const Vote = require("../models/Vote");
const Bot = require("../models/Bot");
const { getConfig } = require("../utils/config");
const { invalidatePrefix } = require("./cacheService");

function hashIp(ip) {
  return crypto.createHash("sha256").update(String(ip)).digest("hex");
}

async function getLastVote(botId, userId) {
  return Vote.findOne({ bot: botId, user: userId }).sort({ createdAt: -1 });
}

async function getRemainingCooldown(botId, userId) {
  const { vote } = getConfig();
  const lastVote = await getLastVote(botId, userId);
  if (!lastVote) return 0;

  const elapsedSeconds = (Date.now() - lastVote.createdAt.getTime()) / 1000;
  const remaining = vote.cooldown - elapsedSeconds;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

async function castVote(bot, user, ip) {
  if (String(bot.ownerId) === String(user._id)) {
    throw Object.assign(new Error("Kendi botuna oy veremezsin."), { code: "SELF_VOTE" });
  }

  const remaining = await getRemainingCooldown(bot._id, user._id);
  if (remaining > 0) {
    throw Object.assign(new Error("Oy verme bekleme suresi devam ediyor."), {
      code: "COOLDOWN",
      remaining,
    });
  }

  await Vote.create({ bot: bot._id, user: user._id, ipHash: hashIp(ip) });

  const updated = await Bot.findByIdAndUpdate(
    bot._id,
    { $inc: { voteCount: 1, monthlyVoteCount: 1, weeklyVoteCount: 1 } },
    { new: true }
  );

  invalidatePrefix("bots:top");
  invalidatePrefix("bots:trending");

  return updated;
}

module.exports = { castVote, getRemainingCooldown, hashIp };

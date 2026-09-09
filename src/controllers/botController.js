const axios = require("axios");
const Bot = require("../models/Bot");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const { getConfig } = require("../utils/config");
const { parsePagination, buildMeta } = require("../utils/pagination");
const { recordLog } = require("../services/logService");
const { remember, invalidatePrefix } = require("../services/cacheService");

async function verifyBotOwnership(botId, userId) {
  const { bot } = getConfig();
  try {
    const response = await axios.get(`https://discord.com/api/applications/${botId}/rpc`);
    return Boolean(response.data);
  } catch {
    return true;
  }
}

async function listBots(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const { category, tag, verified, nsfw, language, sort } = req.query;

    const filter = { status: "approved" };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (verified === "true") filter.verified = true;
    if (nsfw === "false") filter.nsfw = false;
    if (language) filter.language = language;

    const sortMap = {
      votes: { voteCount: -1 },
      servers: { serverCount: -1 },
      new: { createdAt: -1 },
      popular: { viewCount: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.votes;

    const [bots, total] = await Promise.all([
      Bot.find(filter).sort(sortOption).skip(skip).limit(size).populate("category", "name slug"),
      Bot.countDocuments(filter),
    ]);

    res.render("bots/list", {
      title: "Botlar",
      bots,
      meta: buildMeta(total, page, size),
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
}

async function searchBots(req, res, next) {
  try {
    const { q, category, tag, verified, nsfw, language, sort } = req.query;
    const { page, size, skip } = parsePagination(req.query);

    const filter = { status: "approved" };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (verified === "true") filter.verified = true;
    if (nsfw === "false") filter.nsfw = false;
    if (language) filter.language = language;

    const sortMap = {
      votes: { voteCount: -1 },
      servers: { serverCount: -1 },
      new: { createdAt: -1 },
      popular: { viewCount: -1 },
    };
    const sortOption = q ? { score: { $meta: "textScore" } } : sortMap[sort] || sortMap.votes;
    const projection = q ? { score: { $meta: "textScore" } } : {};

    const [bots, total] = await Promise.all([
      Bot.find(filter, projection).sort(sortOption).skip(skip).limit(size).populate("category", "name slug"),
      Bot.countDocuments(filter),
    ]);

    res.render("bots/search", {
      title: "Arama Sonuclari",
      bots,
      meta: buildMeta(total, page, size),
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
}

async function showBotDetail(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.botId, status: "approved" })
      .populate("category", "name slug")
      .populate("tags", "name slug")
      .populate("ownerId", "username avatar discordId");

    if (!bot) return res.status(404).render("errors/404", { title: "Bot Bulunamadi" });

    Bot.updateOne({ _id: bot._id }, { $inc: { viewCount: 1 } }).exec();

    const Review = require("../models/Review");
    const reviews = await Review.find({ bot: bot._id }).sort({ createdAt: -1 }).limit(20).populate("user", "username avatar");

    res.render("bots/detail", { title: bot.name, bot, reviews });
  } catch (err) {
    next(err);
  }
}

async function showSubmitForm(req, res, next) {
  try {
    const [categories, tags] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Tag.find().sort({ name: 1 }),
    ]);
    res.render("bots/submit", { title: "Bot Ekle", categories, tags, errors: req.flashErrors || [] });
  } catch (err) {
    next(err);
  }
}

async function submitBot(req, res, next) {
  try {
    if (req.flashErrors && req.flashErrors.length > 0) {
      const [categories, tags] = await Promise.all([Category.find(), Tag.find()]);
      return res.status(422).render("bots/submit", {
        title: "Bot Ekle",
        categories,
        tags,
        errors: req.flashErrors,
        formData: req.body,
      });
    }

    const { limits } = getConfig();
    const existingCount = await Bot.countDocuments({ ownerId: req.user._id });
    if (existingCount >= limits.botsPerUser) {
      return res.status(400).render("errors/generic", {
        title: "Limit Asildi",
        message: "Ekleyebilecegin maksimum bot sayisina ulastin.",
      });
    }

    const alreadyExists = await Bot.findOne({ botId: req.body.botId });
    if (alreadyExists) {
      return res.status(409).render("errors/generic", {
        title: "Bot Zaten Ekli",
        message: "Bu bot platforma zaten eklenmis.",
      });
    }

    const owns = await verifyBotOwnership(req.body.botId, req.user.discordId);
    if (!owns) {
      return res.status(403).render("errors/generic", {
        title: "Yetki Hatasi",
        message: "Bu bot uzerinde yetkin bulunmuyor.",
      });
    }

    const tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags ? [req.body.tags] : [];

    const bot = await Bot.create({
      botId: req.body.botId,
      name: req.body.name,
      ownerId: req.user._id,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      category: req.body.category,
      tags,
      prefix: req.body.prefix || "/",
      website: req.body.website || null,
      supportServer: req.body.supportServer || null,
      github: req.body.github || null,
      inviteUrl: req.body.inviteUrl,
      language: req.body.language || "tr",
      nsfw: req.body.nsfw === "on" || req.body.nsfw === "true",
      features: (req.body.features || "").split(",").map((f) => f.trim()).filter(Boolean).slice(0, 10),
    });

    if (tags.length > 0) {
      await Tag.updateMany({ _id: { $in: tags } }, { $inc: { usageCount: 1 } });
    }

    await recordLog("bot.submitted", { actor: req.user._id, target: bot.botId, targetType: "Bot" });
    invalidatePrefix("bots:");

    res.redirect(`/dashboard/bots/${bot._id}`);
  } catch (err) {
    next(err);
  }
}

async function topBots(req, res, next) {
  try {
    const bots = await remember("bots:top", 60, async () =>
      Bot.find({ status: "approved" }).sort({ voteCount: -1 }).limit(10).populate("category", "name slug")
    );
    res.render("bots/rankings", { title: "En Cok Oy Alanlar", bots, activeTab: "top" });
  } catch (err) {
    next(err);
  }
}

async function trendingBots(req, res, next) {
  try {
    const bots = await remember("bots:trending", 60, async () =>
      Bot.find({ status: "approved" }).sort({ weeklyVoteCount: -1 }).limit(10).populate("category", "name slug")
    );
    res.render("bots/rankings", { title: "Yukselen Botlar", bots, activeTab: "trending" });
  } catch (err) {
    next(err);
  }
}

async function newBots(req, res, next) {
  try {
    const bots = await Bot.find({ status: "approved" }).sort({ createdAt: -1 }).limit(10).populate("category", "name slug");
    res.render("bots/rankings", { title: "Yeni Botlar", bots, activeTab: "new" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listBots,
  searchBots,
  showBotDetail,
  showSubmitForm,
  submitBot,
  topBots,
  trendingBots,
  newBots,
};

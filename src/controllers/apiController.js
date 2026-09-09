const Bot = require("../models/Bot");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const { success, failure } = require("../utils/apiResponse");
const { parsePagination, buildMeta } = require("../utils/pagination");
const { getPublicSiteStats } = require("../services/statsService");

async function getBots(req, res, next) {
  try {
    const { page, size, skip } = parsePagination(req.query);
    const filter = { status: "approved" };
    if (req.query.category) filter.category = req.query.category;

    const [bots, total] = await Promise.all([
      Bot.find(filter)
        .sort({ voteCount: -1 })
        .skip(skip)
        .limit(size)
        .select("botId name shortDescription avatar verified voteCount serverCount category")
        .populate("category", "name slug"),
      Bot.countDocuments(filter),
    ]);

    return success(res, bots, buildMeta(total, page, size));
  } catch (err) {
    next(err);
  }
}

async function getBotById(req, res, next) {
  try {
    const bot = await Bot.findOne({ botId: req.params.id, status: "approved" })
      .populate("category", "name slug")
      .populate("tags", "name slug");

    if (!bot) return failure(res, "Bot bulunamadi.", 404);
    return success(res, bot);
  } catch (err) {
    next(err);
  }
}

async function searchApi(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return failure(res, "q parametresi gerekli.", 400);

    const { page, size, skip } = parsePagination(req.query);
    const filter = { status: "approved", $text: { $search: q } };

    const [bots, total] = await Promise.all([
      Bot.find(filter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(size)
        .select("botId name shortDescription avatar verified voteCount"),
      Bot.countDocuments(filter),
    ]);

    return success(res, bots, buildMeta(total, page, size));
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return success(res, categories);
  } catch (err) {
    next(err);
  }
}

async function getTags(req, res, next) {
  try {
    const tags = await Tag.find().sort({ usageCount: -1 });
    return success(res, tags);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await getPublicSiteStats();
    return success(res, stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getBots, getBotById, searchApi, getCategories, getTags, getStats };

const express = require("express");
const router = express.Router();

const botController = require("../controllers/botController");
const voteController = require("../controllers/voteController");
const reviewController = require("../controllers/reviewController");
const reportController = require("../controllers/reportController");
const favoriteController = require("../controllers/favoriteController");

const { requireAuth } = require("../middlewares/auth");
const { submitBotValidator, handleValidation } = require("../validators/botValidators");
const { submitReviewValidator } = require("../validators/reviewValidators");
const { submitReportValidator } = require("../validators/reportValidators");
const { validationResult } = require("express-validator");
const { failure } = require("../utils/apiResponse");

function requireJsonValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return failure(res, "Dogrulama hatasi.", 422, "VALIDATION");
  next();
}

router.get("/bots", botController.listBots);
router.get("/bots/search", botController.searchBots);
router.get("/bots/top", botController.topBots);
router.get("/bots/trending", botController.trendingBots);
router.get("/bots/new", botController.newBots);

router.get("/bots/submit", requireAuth, botController.showSubmitForm);
router.post("/bots/submit", requireAuth, submitBotValidator, handleValidation, botController.submitBot);

router.get("/bot/:botId", botController.showBotDetail);

router.post("/bot/:botId/vote", requireAuth, voteController.voteForBot);
router.get("/bot/:botId/vote-status", voteController.voteStatus);

router.post(
  "/bot/:botId/reviews",
  requireAuth,
  submitReviewValidator,
  requireJsonValidation,
  reviewController.createReview
);
router.put(
  "/reviews/:reviewId",
  requireAuth,
  submitReviewValidator,
  requireJsonValidation,
  reviewController.updateReview
);
router.delete("/reviews/:reviewId", requireAuth, reviewController.deleteReview);

router.post(
  "/bot/:botId/reports",
  requireAuth,
  submitReportValidator,
  requireJsonValidation,
  reportController.createReport
);

router.post("/bot/:botId/favorite", requireAuth, favoriteController.toggleFavorite);

module.exports = router;

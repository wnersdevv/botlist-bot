const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");

router.get("/bots", apiController.getBots);
router.get("/bots/:id", apiController.getBotById);
router.get("/search", apiController.searchApi);
router.get("/categories", apiController.getCategories);
router.get("/tags", apiController.getTags);
router.get("/stats", apiController.getStats);

module.exports = router;

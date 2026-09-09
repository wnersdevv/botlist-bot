const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const favoriteController = require("../controllers/favoriteController");
const { requireAuth } = require("../middlewares/auth");

router.use(requireAuth);

router.get("/", dashboardController.showDashboard);
router.get("/favorites", favoriteController.listFavorites);
router.get("/bots/:id", dashboardController.showBotManage);
router.post("/bots/:id", dashboardController.updateBot);
router.post("/bots/:id/delete", dashboardController.deleteBot);

module.exports = router;

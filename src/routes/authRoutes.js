const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/discord", authController.redirectToDiscord);
router.get("/discord/callback", authController.handleCallback);
router.post("/logout", authController.logout);

module.exports = router;

const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roleAuth");

router.use(requireAuth, requireRole("moderator"));

router.get("/", adminController.showAdminDashboard);

router.get("/bots", adminController.listPendingBots);
router.post("/bots/:id/approve", adminController.approveBot);
router.post("/bots/:id/reject", adminController.rejectBot);
router.post("/bots/:id/suspend", requireRole("admin"), adminController.suspendBot);
router.post("/bots/:id/delete", requireRole("admin"), adminController.deleteBotAdmin);

router.get("/users", requireRole("admin"), adminController.listUsers);
router.post("/users/:id/ban", requireRole("admin"), adminController.banUser);
router.post("/users/:id/unban", requireRole("admin"), adminController.unbanUser);
router.post("/users/:id/role", requireRole("owner"), adminController.setUserRole);

router.get("/reports", adminController.listReports);
router.post("/reports/:id/resolve", adminController.resolveReport);

router.post("/reviews/:id/delete", adminController.deleteReviewAdmin);

router.get("/categories", requireRole("admin"), adminController.manageCategories);
router.post("/categories", requireRole("admin"), adminController.createCategory);
router.post("/categories/:id/delete", requireRole("admin"), adminController.deleteCategory);

router.get("/tags", requireRole("admin"), adminController.manageTags);
router.post("/tags", requireRole("admin"), adminController.createTag);
router.post("/tags/:id/delete", requireRole("admin"), adminController.deleteTag);

router.get("/settings", requireRole("admin"), adminController.showSiteSettings);
router.post("/settings", requireRole("admin"), adminController.updateSiteSettings);

router.get("/logs", requireRole("admin"), adminController.viewLogs);

module.exports = router;

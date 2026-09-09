const { body } = require("express-validator");

const REASONS = ["fake", "malicious", "spam", "misinformation", "inappropriate", "offline", "other"];

const submitReportValidator = [
  body("reason").isIn(REASONS).withMessage("Gecerli bir rapor nedeni sec."),
  body("details").optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

module.exports = { submitReportValidator };

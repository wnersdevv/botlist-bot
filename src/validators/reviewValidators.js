const { body } = require("express-validator");

const submitReviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Puan 1 ile 5 arasinda olmali."),
  body("comment").trim().isLength({ min: 5, max: 600 }).withMessage("Yorum 5-600 karakter olmali."),
];

module.exports = { submitReviewValidator };

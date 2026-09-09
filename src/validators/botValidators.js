const { body, validationResult } = require("express-validator");
const { getConfig } = require("../utils/config");

const DISCORD_SNOWFLAKE = /^[0-9]{17,20}$/;

const submitBotValidator = [
  body("botId").matches(DISCORD_SNOWFLAKE).withMessage("Gecerli bir Discord Bot ID gir."),
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Bot adi 2-60 karakter olmali."),
  body("shortDescription").trim().isLength({ min: 10, max: 200 }).withMessage("Kisa aciklama 10-200 karakter olmali."),
  body("longDescription").trim().isLength({ min: 30, max: 4000 }).withMessage("Detayli aciklama 30-4000 karakter olmali."),
  body("category").isMongoId().withMessage("Gecerli bir kategori sec."),
  body("inviteUrl").isURL().withMessage("Gecerli bir davet linki gir."),
  body("website").optional({ checkFalsy: true }).isURL().withMessage("Gecerli bir website linki gir."),
  body("supportServer").optional({ checkFalsy: true }).isURL().withMessage("Gecerli bir sunucu linki gir."),
  body("github").optional({ checkFalsy: true }).isURL().withMessage("Gecerli bir GitHub linki gir."),
  body("prefix").optional({ checkFalsy: true }).trim().isLength({ max: 10 }),
  body("tags").optional().isArray({ max: 5 }).withMessage("En fazla 5 etiket secilebilir."),
  body("nsfw").optional().isBoolean(),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  if (req.originalUrl.startsWith("/api")) {
    return res.status(422).json({ success: false, error: { message: "Dogrulama hatasi.", details: errors.array() } });
  }

  req.flashErrors = errors.array();
  next();
}

module.exports = { submitBotValidator, handleValidation };

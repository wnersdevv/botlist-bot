const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 600 },
    edited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ bot: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);

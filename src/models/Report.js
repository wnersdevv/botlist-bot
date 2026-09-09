const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    bot: { type: mongoose.Schema.Types.ObjectId, ref: "Bot", required: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: ["fake", "malicious", "spam", "misinformation", "inappropriate", "offline", "other"],
      required: true,
    },
    details: { type: String, maxlength: 500, default: "" },
    status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open", index: true },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
